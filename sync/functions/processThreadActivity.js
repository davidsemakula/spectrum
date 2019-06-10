// @flow
import { getCommunityById } from 'shared/db/queries/community';
import { getThreadById } from 'shared/db/queries/thread';
import { getUserById } from 'shared/db/queries/user';
import { getCommunitySettings } from 'api/models/communitySettings';

const debug = require('debug')('sync:queue:process-thread-activity');
import type { ReputationEventJobData } from 'shared/bull/types';
import { shareCommunityActivity } from '../zapier';

export default async (type: string, data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  const user = await getUserById(userId),
    thread = await getThreadById(entityId),
    community = await getCommunityById(thread.communityId),
    communitySettings = await getCommunitySettings(entityId);

  shareCommunityActivity(type, community, {
    user,
    thread,
  });

  let promiseArray = [];

  debug(`Processing thread activity event: ${type}`);
  debug(`Got threadId: ${entityId}`);
  return Promise.all(promiseArray);
};
