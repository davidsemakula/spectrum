// @flow
import { getCommunityById } from 'shared/db/queries/community';
import { getChannelById } from 'shared/db/queries/channel';
import { getThreadById } from 'shared/db/queries/thread';
import { getUserById } from 'shared/db/queries/user';
import { getThreadReaction } from 'api/models/threadReaction';

const debug = require('debug')('sync:queue:process-threadreaction-activity');
import type { ReputationEventJobData } from 'shared/bull/types';
import { shareCommunityActivity } from '../zapier';
import { syncUserActivity } from '../hubspot/utils';

export default async (type: string, data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  const user = await getUserById(userId),
    threadReaction = await getThreadReaction(entityId),
    thread = await getThreadById(threadReaction.threadId);

  let channel = null,
    community = null;

  if (thread.communityId) {
    community = await getCommunityById(thread.communityId);
  }

  if (thread.channelId) {
    channel = await getChannelById(thread.channelId);
  }

  if (community) {
    shareCommunityActivity(type, community, {
      user,
      threadReaction,
      thread,
      channel,
    });
  }

  let promiseArray = [
    syncUserActivity(type, {
      user,
      threadReaction,
      thread,
      channel,
      community,
    }),
  ];

  debug(`Processing threadReaction activity event: ${type}`);
  debug(`Got threadReactionId: ${entityId}`);
  return Promise.all(promiseArray);
};
