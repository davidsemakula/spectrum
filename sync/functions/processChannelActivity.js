// @flow
import { getCommunityById } from 'shared/db/queries/community';
import { getChannelById } from 'shared/db/queries/channel';
import { getUserById } from 'shared/db/queries/user';
import { getCommunitySettings } from 'api/models/communitySettings';

const debug = require('debug')('sync:queue:process-thread-activity');
import type { ReputationEventJobData } from 'shared/bull/types';
import { shareCommunityActivity } from '../zapier';

export default async (type: string, data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  const user = await getUserById(userId),
    channel = await getChannelById(entityId),
    community = await getCommunityById(channel.communityId),
    communitySettings = await getCommunitySettings(entityId);

  shareCommunityActivity(type, community, {
    user,
    channel,
  });

  let promiseArray = [];

  debug(`Processing channel activity event: ${type}`);
  debug(`Got channelId: ${entityId}`);
  return Promise.all(promiseArray);
};
