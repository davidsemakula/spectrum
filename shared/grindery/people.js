// @flow

const debug = require('debug')('shared:grindery:people');
import Raven from 'shared/raven';
const { getUserById } = require('shared/db/queries/user');
const fetch = require('node-fetch');

export async function indexUserProfile(userId) {
  const user = await getUserById(userId);
  if (!user) {
    debug(`indexUserProfile: No user with ID ${userId}`);
    return;
  }
  if (!user.email) {
    return;
  }
  const res = await fetch(
    'https://people.grindery.io/api/events/spectrum/user',
    {
      method: 'post',
      body: JSON.stringify(user),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GRINDERY_PEOPLE_TOKEN}`,
      },
    }
  );
  if (!res.ok) {
    Raven.captureMessage('Error when sending user for indexing', {
      extra: {
        status: res.status,
        result: res.text(),
      },
    });
  }
}
