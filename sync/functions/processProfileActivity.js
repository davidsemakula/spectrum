// @flow
import { getUserById } from '../../shared/db/queries/user';

const debug = require('debug')('sync:queue:process-profile-activity');
import type { ReputationEventJobData } from 'shared/bull/types';

import {
  refreshToken,
  parseUserProperties,
  createOrUpdateContactByEmail,
} from '../hubspot/index';

export default async (type: string, data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  const user = await getUserById(userId);

  let promiseArray = [];

  if (user.email) {
    const token = await refreshToken(process.env.HUBSPOT_REFRESH_TOKEN);
    if (token) {
      promiseArray.push(
        createOrUpdateContactByEmail(
          user.email,
          parseUserProperties(user),
          token
        )
      );
    }
  }

  debug(`Processing profile activity event: ${type}`);
  debug(`Got userId: ${entityId}`);
  return Promise.all(promiseArray);
};
