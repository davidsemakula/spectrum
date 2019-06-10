// @flow
import { getCommunityById } from 'shared/db/queries/community';
import { getUserById } from 'shared/db/queries/user';
import { getCommunitySettings } from 'api/models/communitySettings';

const debug = require('debug')('sync:queue:process-community-activity');
import type { ReputationEventJobData } from 'shared/bull/types';
import { shareCommunityActivity } from '../zapier';

export default async (type: string, data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;

  const user = await getUserById(userId),
    community = await getCommunityById(entityId),
    communitySettings = await getCommunitySettings(entityId);

  shareCommunityActivity(type, community, { user });

  let promiseArray = [];

  debug(`Processing community activity event: ${type}`);
  debug(`Got communityId: ${entityId}`);
  return Promise.all(promiseArray);
};
