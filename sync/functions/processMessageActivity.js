// @flow
import { getCommunityById } from 'shared/db/queries/community';
import { getMessageById } from 'shared/db/queries/message';
import { getThreadById } from 'shared/db/queries/thread';
import { getUserById } from 'shared/db/queries/user';
import { getCommunitySettings } from '../../api/models/communitySettings';

const debug = require('debug')('sync:queue:process-message-activity');
import type { ReputationEventJobData } from 'shared/bull/types';
import { shareCommunityActivity } from '../zapier';

export default async (type: string, data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  const user = await getUserById(userId),
    message = await getMessageById(entityId),
    thread = await getThreadById(message.threadId),
    community = await getCommunityById(thread.communityId),
    communitySettings = await getCommunitySettings(entityId);

  shareCommunityActivity(type, community, {
    user,
    message,
    thread,
  });

  let promiseArray = [];

  debug(`Processing message activity event: ${type}`);
  debug(`Got messageId: ${entityId}`);
  return Promise.all(promiseArray);
};
