// @flow
import { getCommunityById } from 'shared/db/queries/community';
import { getChannelById } from 'shared/db/queries/channel';
import { getMessageById } from 'shared/db/queries/message';
import { getThreadById } from 'shared/db/queries/thread';
import { getUserById } from 'shared/db/queries/user';

const debug = require('debug')('sync:queue:process-message-activity');
import type { ReputationEventJobData } from 'shared/bull/types';
import { shareCommunityActivity } from '../zapier';
import { syncUserActivity } from '../hubspot/utils';

export default async (type: string, data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  const user = await getUserById(userId),
    message = await getMessageById(entityId),
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
      message,
      thread,
      channel,
    });
  }

  let promiseArray = [
    syncUserActivity(type, { user, message, thread, channel, community }),
  ];

  debug(`Processing message activity event: ${type}`);
  debug(`Got messageId: ${entityId}`);
  return Promise.all(promiseArray);
};
