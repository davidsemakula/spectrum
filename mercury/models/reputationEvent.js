// @flow
const { db } = require('shared/db');

export const saveReputationEvent = ({
  userId,
  type,
  communityId,
  score,
}: {
  userId: string,
  type: string,
  communityId: string,
  score: number,
}): Promise<Object> => {
  return db
    .table('reputationEvents')
    .insert({
      timestamp: new Date(),
      userId,
      type,
      communityId,
      score,
    })
    .run();
};

export const upsertUserReputationEvent = ({
  userId,
  type,
  score,
}: {
  userId: string,
  type: string,
  score: number,
}): Promise<Object> => {
  const communityId = 'no-community';

  const currentEventRep = db
    .table('reputationEvents')
    .filter({ userId, type, communityId })
    .nth(0)
    .run()
    .catch(err => {});

  let eventData = {
    timestamp: new Date(),
    userId,
    type,
    communityId,
    score,
  };

  if (currentEventRep && currentEventRep.id) {
    eventData.id = currentEventRep.id;
  }

  return db
    .table('reputationEvents')
    .insert(eventData, { conflict: 'update' })
    .run();
};
