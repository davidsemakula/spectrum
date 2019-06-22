const hubspotUtils = require('./index');

(async () => {
  const accessToken = await hubspotUtils.refreshToken(
    process.env.HUBSPOT_REFRESH_TOKEN
  );
  await hubspotUtils.createSpectrumContactProperties(accessToken);
  await hubspotUtils.createSpectrumTimelineEvents();
})();
