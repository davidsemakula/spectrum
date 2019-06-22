const axios = require('axios'),
  _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  moment = require('moment');

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID,
  HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET,
  HUBSPOT_APP_ID = process.env.HUBSPOT_APP_ID,
  HUBSPOT_DEV_HAPI_KEY = process.env.HUBSPOT_DEV_HAPI_KEY,
  HUBSPOT_DEV_USER_ID = process.env.HUBSPOT_DEV_USER_ID;

const API_BASE_URL = 'https://api.hubapi.com',
  ENDPOINT_REFRESH_TOKEN = '/oauth/v1/token',
  ENDPOINT_CONTACT_PROPERTY_GROUP = '/properties/v1/contacts/groups',
  ENDPOINT_CONTACT_PROPERTY = '/properties/v1/contacts/properties',
  ENDPOINT_CONTACT = '/contacts/v1/contact',
  ENDPOINT_CREATE_OR_UPDATE_CONTACT =
    '/contacts/v1/contact/createOrUpdate/email',
  ENDPOINT_TIMELINE_EVENT_TYPES = `/integrations/v1/${HUBSPOT_APP_ID}/timeline/event-types`,
  ENDPOINT_TIMELINE_EVENT = `/integrations/v1/${HUBSPOT_APP_ID}/timeline/event`;

const IS_PROD = process.env.NODE_ENV === 'production' && !process.env.FORCE_DEV;

function HubSpotUtils() {}

const self = HubSpotUtils.prototype;

/*
 * General utilities
 * */

HubSpotUtils.prototype.CONTACT_PROPERTY_MAP = {
  firstName: 'firstname',
  lastName: 'lastname',
  name: 'spectrum_name',
  username: 'spectrum_username',
  description: 'spectrum_bio',
  website: 'spectrum_website',
  // : 'spectrum_reputation',
  // : 'spectrum_community_member',
  // : 'spectrum_community_admin',
  // : 'spectrum_join_date',
  createdAt: 'spectrum_registration_date',
  lastSeen: 'spectrum_last_activity_date',
};

const EVENT_TYPES = [
  ['Sign Up', 'signed up'],
  ['Sign In', 'signed in'],
  ['Log Out', 'logged out'],
  [
    'Create Community',
    'Created a community: [{{ communityName }}]({{ communityUrl }})',
    'Community Name: {{ communityName }}',
    ['communityId', 'communityName', 'communitySlug', 'communityUrl'],
  ],
  [
    'Join Community',
    'Joined a community: [{{ communityName }}]({{ communityUrl }})',
    'Community Name: {{ communityName }}',
    ['communityId', 'communityName', 'communitySlug', 'communityUrl'],
  ],
  [
    'Create Channel',
    'Created a [channel]({{ channelUrl }})',
    'Channel Name: {{ channelName }}',
    ['channelId', 'channelName', 'channelSlug', 'channelUrl'],
  ],
  [
    'Join Channel',
    'Joined a [channel]({{ channelUrl }})',
    'Channel Name: {{ channelName }}',
    ['channelId', 'channelName', 'channelSlug', 'channelUrl'],
  ],
  [
    'Create Thread',
    'Created a [thread]({{ threadUrl }})',
    '{{ threadTitle }}\n{{ threadBody }}',
    ['threadId', 'threadTitle', 'threadBody', 'threadSlug', 'threadUrl'],
  ],
  [
    'Create Message',
    '[Replied]({{ messageUrl }}) to a thread',
    '{{ messageBody }}',
    ['messageId', 'messageBody', 'messageSlug', 'messageUrl'],
  ],
  [
    'Like',
    'Liked a [post]({{ threadUrl }})',
    '{{ threadTitle }}',
    ['likeId', 'threadTitle', 'threadId', 'threadUrl'],
  ],
  [
    'Send Direct Message',
    'Sent a [DM]({{ messageUrl }})',
    `{{ messageBody }}`,
    ['messageId', 'messageBody', 'messageUrl'],
  ],
];

HubSpotUtils.prototype.parseUserProperties = user => {
  let props = [];
  Object.keys(self.CONTACT_PROPERTY_MAP).forEach(key => {
    const hsKey = self.CONTACT_PROPERTY_MAP[key];
    if (hsKey) {
      let hsValue = user[key];
      if (hsValue && /_date/i.test(hsKey)) {
        hsValue = moment(hsValue).valueOf();
      }
      props.push({ property: hsKey, value: hsValue });
    }
  });
  return props;
};

HubSpotUtils.prototype.parseEventType = eventTypeName => {
  const eventTypes = IS_PROD
    ? require('./timeline-event-types.json')
    : require('./timeline-event-types.test.json');

  let eventTypesMap = {};

  eventTypes.forEach(event => {
    eventTypesMap[event.name] = event;
  });

  return eventTypesMap[eventTypeName];
};

HubSpotUtils.prototype.parseEventTypeProperties = eventTypeName => {
  for (let [
    eventName,
    headerTemplate,
    detailTemplate,
    eventProperties,
  ] of EVENT_TYPES) {
    if (eventName === eventTypeName) {
      return eventProperties || [];
    }
  }
  return [];
};

HubSpotUtils.prototype.getEndpointURL = endpoint => {
  return `${API_BASE_URL}${endpoint}`;
};

/*
 * Auth utilities
 * */

HubSpotUtils.prototype.refreshToken = async refreshToken => {
  const res = await axios.post(
    `${self.getEndpointURL(ENDPOINT_REFRESH_TOKEN)}`,
    `refresh_token=${refreshToken}&client_id=${HUBSPOT_CLIENT_ID}&client_secret=${HUBSPOT_CLIENT_SECRET}&grant_type=refresh_token`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return (res && res.data && res.data.access_token) || null;
};

HubSpotUtils.prototype.getAuthedHeader = token => {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

/*
 * Contact utilities
 * */

HubSpotUtils.prototype.getContactByEmail = async (email, apiKey) => {
  const res = await axios
    .get(`${self.getEndpointURL(ENDPOINT_CONTACT)}/email/${email}/profile`, {
      headers: self.getAuthedHeader(apiKey),
    })
    .catch(function(error) {
      console.error('Get contact group error:', error);
    });
  return (res && res.data) || null;
};

HubSpotUtils.prototype.createOrUpdateContactByEmail = async (
  email,
  properties,
  apiKey
) => {
  const res = await axios
    .post(
      `${self.getEndpointURL(ENDPOINT_CREATE_OR_UPDATE_CONTACT)}/${email}`,
      {
        properties,
      },
      {
        headers: self.getAuthedHeader(apiKey),
      }
    )
    .catch(err => {
      console.error(
        '❌ failed to create or update contact',
        err.response,
        err.response.status
      );
    });
  return (res && res.data) || null;
};

HubSpotUtils.prototype.getContactPropertyGroup = async (groupName, apiKey) => {
  const res = await axios
    .get(
      `${self.getEndpointURL(
        ENDPOINT_CONTACT_PROPERTY_GROUP
      )}/named/${groupName}`,
      {
        headers: self.getAuthedHeader(apiKey),
      }
    )
    .catch(err => {});
  return (res && res.data) || null;
};

HubSpotUtils.prototype.createContactPropertyGroup = async (data, apiKey) => {
  const res = await axios
    .post(`${self.getEndpointURL(ENDPOINT_CONTACT_PROPERTY_GROUP)}`, data, {
      headers: self.getAuthedHeader(apiKey),
    })
    .catch(err => {
      console.error(
        '❌ failed to create contact property group',
        err.response.status,
        err.response
      );
    });
  return (res && res.data) || null;
};

HubSpotUtils.prototype.getContactProperties = async apiKey => {
  const res = await axios
    .get(`${self.getEndpointURL(ENDPOINT_CONTACT_PROPERTY)}`, {
      headers: self.getAuthedHeader(apiKey),
    })
    .catch(err => {
      console.error('❌ failed to get contact properties', err.response.status);
    });
  return (res && res.data) || null;
};

HubSpotUtils.prototype.createOrUpdateContactProperty = async (
  id,
  data,
  apiKey
) => {
  let res = null;
  if (id) {
    res = await axios
      .put(
        `${self.getEndpointURL(ENDPOINT_CONTACT_PROPERTY)}/named/${id}`,
        data,
        {
          headers: self.getAuthedHeader(apiKey),
        }
      )
      .catch(err => {
        console.error('❌ failed to update property', err.response.status);
      });
  } else {
    res = await axios
      .post(`${self.getEndpointURL(ENDPOINT_CONTACT_PROPERTY)}`, data, {
        headers: self.getAuthedHeader(apiKey),
      })
      .catch(err => {
        console.error('❌ failed to create property', err.response.status);
      });
  }
  return (res && res.data) || null;
};

/*
 * Event utilities
 * */

HubSpotUtils.prototype.getEventTypes = async () => {
  const res = await axios
    .get(
      `${self.getEndpointURL(
        ENDPOINT_TIMELINE_EVENT_TYPES
      )}?hapikey=${HUBSPOT_DEV_HAPI_KEY}&userId=${HUBSPOT_DEV_USER_ID}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    )
    .catch(err => {
      console.error('❌ failed to get event types', err.response.status);
    });
  return (res && res.data) || null;
};

HubSpotUtils.prototype.createOrUpdateEventType = async (id, data) => {
  let res = null;
  if (id) {
    res = await axios
      .put(
        `${self.getEndpointURL(
          ENDPOINT_TIMELINE_EVENT_TYPES
        )}/${id}?hapikey=${HUBSPOT_DEV_HAPI_KEY}&userId=${HUBSPOT_DEV_USER_ID}`,
        Object.assign({}, data, { applicationId: HUBSPOT_APP_ID }),
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )
      .catch(err => {
        console.error('❌ failed to update event type', err.response.status);
      });
  } else {
    res = await axios
      .post(
        `${self.getEndpointURL(
          ENDPOINT_TIMELINE_EVENT_TYPES
        )}?hapikey=${HUBSPOT_DEV_HAPI_KEY}&userId=${HUBSPOT_DEV_USER_ID}`,
        Object.assign({}, data, { applicationId: HUBSPOT_APP_ID }),
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )
      .catch(err => {
        console.error('❌ failed to create event type', err.response.status);
      });
  }
  return (res && res.data) || null;
};

HubSpotUtils.prototype.getEventTypeProperties = async eventTypeId => {
  const res = await axios
    .get(
      `${self.getEndpointURL(
        ENDPOINT_TIMELINE_EVENT_TYPES
      )}/${eventTypeId}/properties?hapikey=${HUBSPOT_DEV_HAPI_KEY}&userId=${HUBSPOT_DEV_USER_ID}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    )
    .catch(err => {
      console.error(
        '❌ failed to get event type properties',
        err.response.status
      );
    });
  return (res && res.data) || null;
};

HubSpotUtils.prototype.createOrUpdateEventTypeProperty = async (
  eventTypeId,
  data,
  trials = 0
) => {
  let res = null;
  if (data.id) {
    res = await axios
      .put(
        `${self.getEndpointURL(
          ENDPOINT_TIMELINE_EVENT_TYPES
        )}/${eventTypeId}/properties?hapikey=${HUBSPOT_DEV_HAPI_KEY}&userId=${HUBSPOT_DEV_USER_ID}`,
        Object.assign({}, data, { applicationId: HUBSPOT_APP_ID }),
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )
      .catch(err => {
        console.error(
          '❌ failed to update event type property',
          err.response.status
        );
      });
  } else {
    res = await axios
      .post(
        `${self.getEndpointURL(
          ENDPOINT_TIMELINE_EVENT_TYPES
        )}/${eventTypeId}/properties?hapikey=${HUBSPOT_DEV_HAPI_KEY}&userId=${HUBSPOT_DEV_USER_ID}`,
        Object.assign({}, data, { applicationId: HUBSPOT_APP_ID }),
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )
      .catch(err => {
        console.error(
          '❌ failed to create event type property',
          err.response.status
        );
      });
  }
  if (trials < 3) {
    return self.createOrUpdateEventTypeProperty(eventTypeId, data, trials + 1);
  }
  return (res && res.data) || null;
};

HubSpotUtils.prototype.createOrUpdateTimelineEvent = async (
  id,
  email,
  eventTypeId,
  token,
  data
) => {
  const res = await axios
    .put(
      `${self.getEndpointURL(ENDPOINT_TIMELINE_EVENT)}`,
      Object.assign(
        {},
        {
          id,
          email,
          eventTypeId,
          applicationId: HUBSPOT_APP_ID,
        },
        data || {}
      ),
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .catch(err => {
      console.error(
        '❌ failed to update event',
        err.response.status,
        err.response.data
      );
    });
  return (res && res.data) || null;
};

/*
 * Setup utilities
 * */

HubSpotUtils.prototype.createSpectrumContactProperties = async apiKey => {
  const groupDisplayName = 'Spectrum',
    groupName = _.snakeCase(groupDisplayName);

  let group = await self.getContactPropertyGroup(groupName, apiKey);

  if (group) {
    console.log('✅ group already exists => ', group.name);
  } else {
    group = await self.createContactPropertyGroup(
      {
        name: groupName,
        displayName: groupDisplayName,
      },
      apiKey
    );

    if (group) {
      console.log('✅ created group => ', group.name);
    }
  }

  if (group) {
    const existingProperties = (
      (await self.getContactProperties(apiKey)) || []
    ).map(item => {
      return item.name;
    });

    const contactProperties = [
      ['name', 'Name', 'string', 'text'],
      ['username', 'Username', 'string', 'text'],
      ['bio', 'Bio', 'string', 'text'],
      ['website', 'Website', 'string', 'text'],
      ['reputation', 'Reputation', 'number', 'number'],
      ['community_member', 'Community Member', 'string', 'booleancheckbox'],
      ['community_admin', 'Community Admin', 'string', 'booleancheckbox'],
      ['join_date', 'Join Date', 'datetime', 'date'],
      ['registration_date', 'Registration Date', 'datetime', 'date'],
      ['last_activity_date', 'Last Activity Date', 'datetime', 'date'],
      [
        'last_terms_accepted_date',
        'Last Terms Accepted Date',
        'datetime',
        'date',
      ],
    ];

    let properties = [];

    for (let [name, displayName, type, fieldType] of contactProperties) {
      const propName = `spectrum_${name}`, //_.snakeCase(propLabel),
        propLabel = `Spectrum ${displayName}`,
        existingName = existingProperties.includes(propName) ? propName : null;

      const property = await self.createOrUpdateContactProperty(
        existingName,
        {
          name: propName,
          label: propLabel,
          groupName: groupName,
          type,
          fieldType,
        },
        apiKey
      );

      if (property) {
        properties.push(property);
        console.log(
          `✅ ${existingName ? 'updated' : 'created'} property => `,
          propName
        );
      } else {
        console.error('❌ Failed to create property => ', propName);
      }
    }
  } else {
    console.error('❌ Failed to create Spectrum property group');
  }
};

HubSpotUtils.prototype.createSpectrumTimelineEvents = async () => {
  const existingEventNamesMap = {};
  ((await self.getEventTypes()) || []).map(item => {
    existingEventNamesMap[item.name] = item.id;
  });

  let events = [],
    properties = [];

  for (let [
    eventName,
    headerTemplate,
    detailTemplate,
    eventProperties,
  ] of EVENT_TYPES) {
    const eventId = existingEventNamesMap[eventName] || null;

    let eventTypeData = {
      name: eventName,
      objectType: 'CONTACT',
      headerTemplate: headerTemplate,
    };

    if (detailTemplate) {
      eventTypeData['detailTemplate'] = detailTemplate;
    }

    const eventType = await self.createOrUpdateEventType(
      eventId,
      eventTypeData
    );

    if (eventType) {
      events.push(eventType);
      console.log(
        `✅ ${eventId ? 'updated' : 'created'} event type => `,
        eventName
      );

      if (
        eventProperties &&
        Array.isArray(eventProperties) &&
        eventProperties.length
      ) {
        const existingPropertiesMap = {};
        ((await self.getEventTypeProperties(eventType.id)) || []).forEach(
          item => {
            existingPropertiesMap[item.name] = item.id;
          }
        );

        for (let propName of eventProperties) {
          const data = {
              name: propName,
              label: propName,
              propertyType: 'String',
            },
            propId = existingPropertiesMap[propName];

          if (propId) {
            data.id = propId;
          }

          const property = await self.createOrUpdateEventTypeProperty(
            eventType.id,
            data
          );
          if (property) {
            properties.push(property);
            console.log(
              `✅ ${propId ? 'updated' : 'created'} event property => `,
              propName
            );
          } else {
            console.error('❌ Failed to create event property => ', propName);
          }
        }
      } else {
        console.error('✅ No event properties to add => ', eventName);
      }
    } else {
      console.error('❌ Failed to create event type => ', eventName);
    }
  }

  fs.writeFile(
    path.join(__dirname, `timeline-event-types${IS_PROD ? '' : '.test'}.json`),
    JSON.stringify(events, null, 4),
    () => {}
  );
};

module.exports = new HubSpotUtils();
