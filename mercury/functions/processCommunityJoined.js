// @flow
const debug = require('debug')('mercury:queue:process-community-created');
import { updateUserReputation } from '../models/usersCommunities';
import { getJoinedCommunitiesCount } from '../models/user';
import {
  COMMUNITIES_JOINED_1,
  COMMUNITIES_JOINED_2,
  COMMUNITIES_JOINED_3,
  COMMUNITIES_JOINED_4,
  COMMUNITIES_JOINED_SCORE_1,
  COMMUNITIES_JOINED_SCORE_2,
  COMMUNITIES_JOINED_SCORE_3,
  COMMUNITIES_JOINED_SCORE_4,
} from '../constants';
import type { ReputationEventJobData } from 'shared/bull/types';

export default async (data: ReputationEventJobData) => {
  // entityId represents the communityId
  const { userId, entityId } = data;

  let promiseArray = [];

  const numJoinedCommunities = await getJoinedCommunitiesCount(userId);
  if (numJoinedCommunities >= 4) {
    promiseArray.push(
      updateUserReputation(
        userId,
        COMMUNITIES_JOINED_SCORE_4,
        COMMUNITIES_JOINED_4
      )
    );
  } else if (numJoinedCommunities === 3) {
    promiseArray.push(
      updateUserReputation(
        userId,
        COMMUNITIES_JOINED_SCORE_3,
        COMMUNITIES_JOINED_3
      )
    );
  } else if (numJoinedCommunities === 2) {
    promiseArray.push(
      updateUserReputation(
        userId,
        COMMUNITIES_JOINED_SCORE_2,
        COMMUNITIES_JOINED_2
      )
    );
  } else if (numJoinedCommunities === 1) {
    promiseArray.push(
      updateUserReputation(
        userId,
        COMMUNITIES_JOINED_SCORE_1,
        COMMUNITIES_JOINED_1
      )
    );
  } else {
    promiseArray.push(Promise.resolve());
  }

  debug(`Processing community created reputation event`);
  debug(`Got communityId: ${entityId}`);
  return Promise.all(promiseArray);
};
