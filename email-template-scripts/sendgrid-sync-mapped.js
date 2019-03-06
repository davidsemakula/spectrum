// @flow
require('now-env');
const fs = require('fs');
const util = require('util');
const fetch = require('isomorphic-fetch');
const textversion = require('textversionjs');
const { SENDGRID_API_KEY } = process.env;
const RELATIVE_PATH_TO_TEMPLATES = '../built-email-templates';
const RELATIVE_PATH_TO_ID_MAPPING = '../hermes/queues/id-mapping.js';
const processArgs = process.argv.slice(2);
const UPDATE_PROD_TEMPLATES = processArgs.some(arg => arg === 'prod');

if (!SENDGRID_API_KEY) {
  console.error('❌ Be sure to provide a SendGrid API key');
  return;
}

const readdirAsync = path => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const getExistingEmailMappings = () => {
  const hostname = 'https://api.sendgrid.com/v3';
  const path = `/templates`;
  const url = hostname + path + '?generations=dynamic';

  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
  };

  console.error('♻️ Getting template mappings');

  return fetch(url, options)
    .then(res => res.json())
    .then(res => {
      let ret = {};
      let promises = [];
      for (const t of res.templates) {
        if (!t.name || !t.id) {
          continue;
        }
        const m = /GC\[([^,]+,[^\]]+)\]/.exec(t.name);
        if (!m) {
          continue;
        }
        if (t.generation !== 'dynamic' || !t.versions.length) {
          console.error(`Deleting old template ${t.id}`);
          promises.push(
            (t.versions.length
              ? fetch(
                  `${hostname}/templates/${t.id}/versions/${t.versions[0].id}`,
                  {
                    ...options,
                    method: 'DELETE',
                  }
                )
              : Promise.resolve()
            ).then(() => {
              fetch(`${hostname}/templates/${t.id}`, {
                ...options,
                method: 'DELETE',
              });
            })
          );
          continue;
        }
        ret[m[1]] = {
          template: t.id,
          version: t.versions[0].id,
        };
      }
      return Promise.all(promises).then(() => ret);
    })
    .catch(err => {
      console.error({ err });
    });
};

const mapConfig = async (config, existingMappings) => {
  const mapKey = `${config.template},${config.version}`;
  if (existingMappings[mapKey]) {
    return existingMappings[mapKey];
  }
  console.error(`♻️ Creating new template: ${mapKey}`);
  const hostname = 'https://api.sendgrid.com/v3';
  const options = {
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
  };
  let resp = await fetch(`${hostname}/templates`, {
    ...options,
    method: 'POST',
    body: JSON.stringify({
      name: `GC[${mapKey}]`,
      generation: 'dynamic',
    }),
  });
  let respJson = await resp.json();
  let templateId = respJson.id;
  if (!templateId) {
    throw new Error(
      `Unexpected response when creating template ${mapKey}: ` +
        JSON.stringify(respJson)
    );
  }
  resp = await fetch(`${hostname}/templates/${templateId}/versions`, {
    ...options,
    method: 'POST',
    body: JSON.stringify({
      name: `V[${mapKey}]`,
      subject: '{{{subject}}}',
      html_content: '<%body%>',
      plain_content: '<%body%>',
    }),
  });
  respJson = await resp.json();
  let versionId = respJson.id;
  if (!versionId) {
    throw new Error(
      'Unexpected response when creating template version: ' +
        JSON.stringify(respJson)
    );
  }
  const ret = { template: templateId, version: versionId };
  existingMappings[mapKey] = ret;
  return ret;
};

const processFile = (file, config) => {
  const plainTextConfig = {
    uIndentationChar: ' ',
    oIndentationChar: ' ',
    listIndentationTabs: 2,
    keepNbsps: true,
    linkProcess: (href, text) => `${text} (${href})`,
  };

  const { version, template } = config;

  const hostname = 'https://api.sendgrid.com/v3';
  const path = `/templates/${template}/versions/${version}`;
  const url = hostname + path;

  const html_content = file;
  const plain_content = textversion(html_content, plainTextConfig);

  const data = {
    html_content,
    plain_content,
    subject: '{{{subject}}}',
  };

  const options = {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  };

  console.error('♻️ Uploading template to SendGrid');

  return fetch(url, options)
    .then(res => res.json())
    .then(res => {
      console.error('✅ Saved template on SendGrid');
    })
    .catch(err => {
      console.error({ err });
    });
};

const processPath = (path, existingMappings) => {
  return new Promise((resolve, reject) => {
    const file = fs.readFile(
      `${RELATIVE_PATH_TO_TEMPLATES}/${path}`,
      { encoding: 'utf-8' },
      (err, file) => {
        if (err) {
          reject({ err });
          return;
        }

        const configStart = file.indexOf('START_CONFIG');
        const configEnd = file.indexOf('END_CONFIG');
        const configString = file
          .slice(configStart, configEnd)
          .replace('START_CONFIG', '')
          .replace(/(\r\n\t|\n|\r\t)/gm, '');
        const config = JSON.parse(configString);

        if (!UPDATE_PROD_TEMPLATES && !config.test) {
          console.error('🔅 No test config for this template, skipping');
          return;
        }

        const { test: testConfig, production: prodConfig } = config;

        resolve(
          Promise.all([
            testConfig &&
              mapConfig(testConfig, existingMappings).then(testConfig =>
                processFile(file, testConfig)
              ),
            UPDATE_PROD_TEMPLATES &&
              mapConfig(prodConfig, existingMappings).then(prodConfig =>
                processFile(file, prodConfig)
              ),
          ])
        );
      }
    );
  });
};

const init = async () => {
  const existingMappings = await getExistingEmailMappings();
  const paths = await readdirAsync(RELATIVE_PATH_TO_TEMPLATES);

  await Promise.all(paths.map(path => processPath(path, existingMappings)));
  const idMapping = {};
  for (const key in existingMappings) {
    idMapping[key.split(',')[0]] = existingMappings[key].template;
  }
  console.log('idMapping => ', idMapping);
  fs.writeFileSync(
    RELATIVE_PATH_TO_ID_MAPPING,
    `const idMapping = ${JSON.stringify(idMapping)}; export default idMapping`
  );
  return idMapping;
};

init().catch(e => console.error(e));
