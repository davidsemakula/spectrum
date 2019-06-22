// @flow
import { getCommunityById } from 'shared/db/queries/community';
import { getChannelById } from 'shared/db/queries/channel';
import { getUserById } from 'shared/db/queries/user';

const debug = require('debug')('sync:queue:process-thread-activity');
import type { ReputationEventJobData } from 'shared/bull/types';
import { shareCommunityActivity } from '../zapier';
import { syncUserActivity } from '../hubspot/utils';

export default async (type: string, data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  const user = await getUserById(userId),
    channel = await getChannelById(entityId),
    community = await getCommunityById(channel.communityId);

  shareCommunityActivity(type, community, {
    user,
    channel,
  });

  let promiseArray = [syncUserActivity(type, { user, channel, community })];

  debug(`Processing channel activity event: ${type}`);
  debug(`Got channelId: ${entityId}`);
  return Promise.all(promiseArray);
};
