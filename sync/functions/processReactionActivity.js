// @flow
import { getCommunityById } from 'shared/db/queries/community';
import { getChannelById } from 'shared/db/queries/channel';
import { getMessageById } from 'shared/db/queries/message';
import { getThreadById } from 'shared/db/queries/thread';
import { getUserById } from 'shared/db/queries/user';
import { getReaction } from 'api/models/reaction';

const debug = require('debug')('sync:queue:przocess-reaction-activity');
import type { ReputationEventJobData } from 'shared/bull/types';
import { shareCommunityActivity } from '../zapier';
import { syncUserActivity } from '../hubspot/utils';

export default async (type: string, data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  const user = await getUserById(userId),
    reaction = await getReaction(entityId),
    message = await getMessageById(reaction.messageId),
    thread = await getThreadById(message.threadId);

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
      reaction,
      message,
      thread,
      channel,
    });
  }

  let promiseArray = [
    syncUserActivity(type, {
      user,
      reaction,
      message,
      thread,
      channel,
      community,
    }),
  ];

  debug(`Processing reaction activity event: ${type}`);
  debug(`Got reactionId: ${entityId}`);
  return Promise.all(promiseArray);
};
