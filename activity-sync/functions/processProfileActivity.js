// @flow
import { getUserById } from '../../shared/db/queries/user';

const debug = require('debug')('activity-sync:queue:process-profile-activity');
import type { ReputationEventJobData } from 'shared/bull/types';

export default async (type: string, data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  const user = await getUserById(userId);

  console.log('type => ', type);
  console.log('user => ', user);

  let promiseArray = [];

  debug(`Processing profile activity event: ${type}`);
  debug(`Got userId: ${entityId}`);
  return Promise.all(promiseArray);
};
