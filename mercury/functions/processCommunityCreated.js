// @flow
const debug = require('debug')('mercury:queue:process-community-created');
import { updateUserReputation } from '../models/usersCommunities';
import { getCreatedCommunitiesCount } from '../models/user';
import {
  COMMUNITIES_CREATED_1,
  COMMUNITIES_CREATED_2,
  COMMUNITIES_CREATED_SCORE_1,
  COMMUNITIES_CREATED_SCORE_2,
} from '../constants';
import type { ReputationEventJobData } from 'shared/bull/types';

export default async (data: ReputationEventJobData) => {
  // entityId represents the communityId
  const { userId, entityId } = data;

  let promiseArray = [];

  const numCreatedCommunities = await getCreatedCommunitiesCount(userId);
  if (numCreatedCommunities >= 2) {
    promiseArray.push(
      updateUserReputation(
        userId,
        COMMUNITIES_CREATED_SCORE_2,
        COMMUNITIES_CREATED_2
      )
    );
  } else if (numCreatedCommunities === 1) {
    promiseArray.push(
      updateUserReputation(
        userId,
        COMMUNITIES_CREATED_SCORE_1,
        COMMUNITIES_CREATED_1
      )
    );
  } else {
    promiseArray.push(Promise.resolve());
  }

  debug(`Processing community created reputation event`);
  debug(`Got communityId: ${entityId}`);
  return Promise.all(promiseArray);
};
