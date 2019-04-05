// @flow
const { db } = require('shared/db');
import {
  saveReputationEvent,
  upsertUserReputationEvent,
} from './reputationEvent';

export const updateReputation = (
  userId: string,
  communityId: string,
  score: number,
  type: string
): Promise<Object> => {
  return db
    .table('usersCommunities')
    .getAll([userId, communityId], { index: 'userIdAndCommunityId' })
    .update({
      reputation: db.row('reputation').add(score),
    })
    .run()
    .then(() =>
      saveReputationEvent({
        userId,
        type,
        communityId,
        score,
      })
    );
};

export const updateUserReputation = (
  userId: string,
  score: number,
  type: string
): Promise<Object> => {
  return upsertUserReputationEvent({
    userId,
    type,
    score,
  });
};

export const getMemberCount = (communityId: string): Promise<number> => {
  return db
    .table('usersCommunities')
    .filter({ communityId, isMember: true })
    .count()
    .default(0)
    .run();
};

export const getNonOwnerMemberCount = (
  communityId: string
): Promise<number> => {
  return db
    .table('usersCommunities')
    .filter({ communityId, isMember: true, isOwner: false })
    .count()
    .default(0)
    .run();
};

export const getOwners = (communityId: string): Promise<Array<Object>> => {
  return db
    .table('usersCommunities')
    .filter({ communityId, isOwner: true })
    .coerceTo('array')
    .run();
};
