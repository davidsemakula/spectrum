//@flow

const { db } = require('shared/db');
import type { DBCommunity } from 'shared/types';
import { getCommunitiesBySlug } from './community';

// prettier-ignore
export const getCuratedCommunities = (type: string): Promise<Array<DBCommunity>> => {
  return db
    .table('curatedContent')
    .filter({ type })
    .run()
    .then(results => (results && results.length > 0 ? results[0] : null))
    .then(result => result && getCommunitiesBySlug(result.data));
};

// prettier-ignore
export const getTopCommunitiesByActivity = (amount: number): Promise<Array<DBCommunity>> => {
  return db
    .table('communities')
    .filter(community => community.hasFields('deletedAt').not().and(community('isPrivate').not()))
    .merge(community => {
      return {
        likeCount: db.table('threadReactions').filter(threadLikes => {
          return db.table('threads').pluck('communityId').map(thread => thread('communityId')).coerceTo("ARRAY").contains(community('id'))
        }).count(),
        threadCount: db.table('threads').filter({communityId: community('id')}).count(),
      }
    })
    .orderBy(db.desc('memberCount'))
    .orderBy(db.desc('threadCount'))
    .orderBy(db.desc('likeCount'))
    .limit(amount)
    .run()
    .then(results => (results));
};
