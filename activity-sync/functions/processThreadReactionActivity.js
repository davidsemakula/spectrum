// @flow
import { getCommunityById } from 'shared/db/queries/community';
import { getThreadById } from 'shared/db/queries/thread';
import { getUserById } from 'shared/db/queries/user';
import { getCommunitySettings } from 'api/models/communitySettings';
import { getThreadReaction } from 'api/models/threadReaction';

const debug = require('debug')(
  'activity-sync:queue:process-threadreaction-activity'
);
import type { ReputationEventJobData } from 'shared/bull/types';
import { shareCommunityActivity } from '../zapier';

export default async (type: string, data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  const user = await getUserById(userId),
    threadReaction = await getThreadReaction(entityId),
    thread = await getThreadById(threadReaction.threadId),
    community = await getCommunityById(thread.communityId),
    communitySettings = await getCommunitySettings(entityId);

  shareCommunityActivity(type, community, {
    user,
    threadReaction,
    thread,
  });

  let promiseArray = [];

  debug(`Processing threadReaction activity event: ${type}`);
  debug(`Got threadReactionId: ${entityId}`);
  return Promise.all(promiseArray);
};
