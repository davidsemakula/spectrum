// @flow
const debug = require('debug')('mercury:queue:process-community-created');
import {
  getNonOwnerMemberCount,
  getOwners,
  updateUserReputation,
} from '../models/usersCommunities';
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
  COMMUNITY_MEMBERS_10,
  COMMUNITY_MEMBERS_2,
  COMMUNITY_MEMBERS_20,
  COMMUNITY_MEMBERS_5,
  COMMUNITY_MEMBERS_SCORE_10,
  COMMUNITY_MEMBERS_SCORE_2,
  COMMUNITY_MEMBERS_SCORE_20,
  COMMUNITY_MEMBERS_SCORE_5,
} from '../constants';
import type { ReputationEventJobData } from 'shared/bull/types';
import { trackQueue } from 'shared/bull/queues';
import { events } from 'shared/analytics';

export default async (data: ReputationEventJobData) => {
  // entityId represents the communityId
  const { userId, entityId } = data;

  let promiseArray = [];

  const numJoinedCommunities = await getJoinedCommunitiesCount(userId);

  let repEventScore = null;

  if (numJoinedCommunities >= 4) {
    promiseArray.push(
      updateUserReputation(
        userId,
        COMMUNITIES_JOINED_SCORE_4,
        COMMUNITIES_JOINED_4
      )
    );

    if (numJoinedCommunities === 4) {
      repEventScore = COMMUNITIES_JOINED_SCORE_4;
    }
  } else if (numJoinedCommunities === 3) {
    promiseArray.push(
      updateUserReputation(
        userId,
        COMMUNITIES_JOINED_SCORE_3,
        COMMUNITIES_JOINED_3
      )
    );

    repEventScore = COMMUNITIES_JOINED_SCORE_3;
  } else if (numJoinedCommunities === 2) {
    promiseArray.push(
      updateUserReputation(
        userId,
        COMMUNITIES_JOINED_SCORE_2,
        COMMUNITIES_JOINED_2
      )
    );

    repEventScore = COMMUNITIES_JOINED_SCORE_2;
  } else if (numJoinedCommunities === 1) {
    promiseArray.push(
      updateUserReputation(
        userId,
        COMMUNITIES_JOINED_SCORE_1,
        COMMUNITIES_JOINED_1
      )
    );

    repEventScore = COMMUNITIES_JOINED_SCORE_1;
  } else {
    promiseArray.push(Promise.resolve());
  }

  if (repEventScore) {
    trackQueue.add({
      userId,
      event: events.TOTAL_COMMUNITIES_JOINED,
      context: {
        userId,
        threshold: numJoinedCommunities,
        score: repEventScore,
      },
    });
  }

  const numNonOwnerMembers = await getNonOwnerMemberCount(entityId);

  if (numNonOwnerMembers >= 2) {
    const communityOwners = await getOwners();

    if (Array.isArray(communityOwners) && communityOwners.length) {
      let memberThresholdScore = null,
        memberThresholdEventType = null;

      if (numNonOwnerMembers >= 20) {
        memberThresholdScore = COMMUNITY_MEMBERS_SCORE_20;
        memberThresholdEventType = COMMUNITY_MEMBERS_20;
      } else if (numNonOwnerMembers >= 10) {
        memberThresholdScore = COMMUNITY_MEMBERS_SCORE_10;
        memberThresholdEventType = COMMUNITY_MEMBERS_10;
      } else if (numNonOwnerMembers >= 5) {
        memberThresholdScore = COMMUNITY_MEMBERS_SCORE_5;
        memberThresholdEventType = COMMUNITY_MEMBERS_5;
      } else if (numNonOwnerMembers >= 2) {
        memberThresholdScore = COMMUNITY_MEMBERS_SCORE_2;
        memberThresholdEventType = COMMUNITY_MEMBERS_2;
      }

      if (memberThresholdScore && memberThresholdEventType) {
        communityOwners.forEach(owner => {
          promiseArray.push(
            updateUserReputation(
              owner.userId,
              memberThresholdScore,
              memberThresholdEventType
            )
          );

          trackQueue.add({
            userId: owner.userId,
            event: events.TOTAL_COMMUNITY_MEMBERS,
            context: {
              userId,
              threshold: numNonOwnerMembers,
              score: memberThresholdScore,
            },
          });
        });
      }
    }
  }

  debug(`Processing community created reputation event`);
  debug(`Got communityId: ${entityId}`);
  return Promise.all(promiseArray);
};
