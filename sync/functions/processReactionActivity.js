// @flow
import { getCommunityById } from 'shared/db/queries/community';
import { getMessageById } from 'shared/db/queries/message';
import { getThreadById } from 'shared/db/queries/thread';
import { getUserById } from 'shared/db/queries/user';
import { getReaction } from 'api/models/reaction';
import { getCommunitySettings } from 'api/models/communitySettings';

const debug = require('debug')('sync:queue:przocess-reaction-activity');
import type { ReputationEventJobData } from 'shared/bull/types';
import { shareCommunityActivity } from '../zapier';

export default async (type: string, data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  const user = await getUserById(userId),
    reaction = await getReaction(entityId),
    message = await getMessageById(reaction.messageId),
    thread = await getThreadById(message.threadId),
    community = await getCommunityById(thread.communityId),
    communitySettings = await getCommunitySettings(entityId);

  shareCommunityActivity(type, community, {
    user,
    reaction,
    message,
    thread,
  });

  let promiseArray = [];

  debug(`Processing reaction activity event: ${type}`);
  debug(`Got reactionId: ${entityId}`);
  return Promise.all(promiseArray);
};
