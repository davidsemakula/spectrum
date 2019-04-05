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
