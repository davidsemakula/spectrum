exports.up = function(r, conn) {
  return r
    .table('users')
    .insert({
      id: 'sam',
      description: "Grindery's automated bot.",
      createdAt: new Date(),
      email: null,
      providerId: null,
      fbProviderId: null,
      githubProviderId: null,
      githubUsername: 'withspectrum',
      googleProviderId: null,
      isOnline: true,
      lastSeen: new Date(),
      modifiedAt: new Date(),
      name: 'Grindery Bot',
      termsLastAcceptedAt: new Date(),
      username: 'spectrumbot',
      website: 'https://chat.grindery.io',
      profilePhoto: '/default_images/sam.png',
    })
    .run(conn);
};
exports.down = function(r, conn) {
  return r
    .table('users')
    .get('sam')
    .delete()
    .run(conn);
};
