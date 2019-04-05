// @flow
const { db } = require('shared/db');

export const getCreatedCommunitiesCount = (userId: string): Promise<number> => {
  return db
    .table('communities')
    .filter({ creatorId: userId })
    .count()
    .default(0)
    .run();
};

export const getOwnedCommunitiesCount = (userId: string): Promise<number> => {
  return db
    .table('usersCommunities')
    .filter({ userId, isOwner: true })
    .count()
    .default(0)
    .run();
};

export const getJoinedCommunitiesCount = (userId: string): Promise<number> => {
  return db
    .table('usersCommunities')
    .filter({ userId, isMember: true })
    .count()
    .default(0)
    .run();
};

export const getThreadCount = (userId: string): Promise<number> => {
  return db
    .table('threads')
    .filter({ creatorId: userId })
    .count()
    .default(0)
    .run();
};

export const getMessageCount = (userId: string): Promise<number> => {
  return db
    .table('messages')
    .filter({ senderId: userId })
    .count()
    .default(0)
    .run();
};

export const getReactionCount = (
  userId: string,
  type: string
): Promise<number> => {
  return db
    .table('reactions')
    .filter({ userId, type })
    .count()
    .default(0)
    .run();
};

export const getReactionByOthersCount = (
  userId: string,
  type: string
): Promise<number> => {
  return db
    .table('reactions')
    .eqJoin('messageId', db.table('messages'), { index: 'id' })
    .zip()
    .filter({ senderId: userId, type })
    .count()
    .default(0)
    .run();
};
