// flow
const debug = require('debug')('sync:queue:process-sync-event');
import processCommunityActivity from '../functions/processCommunityActivity';
import processChannelActivity from '../functions/processChannelActivity';
import processThreadActivity from '../functions/processThreadActivity';
import processMessageActivity from '../functions/processMessageActivity';
import processProfileActivity from '../functions/processProfileActivity';
import processThreadReactionActivity from '../functions/processThreadReactionActivity';
import processReactionActivity from '../functions/processReactionActivity';

import Raven from 'shared/raven';
import {
  THREAD_CREATED,
  THREAD_DELETED,
  THREAD_DELETED_BY_MODERATION,
  MESSAGE_CREATED,
  MESSAGE_DELETED,
  MESSAGE_CREATED_POST_AUTHOR_BONUS,
  MESSAGE_DELETED_POST_AUTHOR_BONUS,
  REACTION_CREATED,
  REACTION_DELETED,
  REACTION_CREATED_POST_AUTHOR_BONUS,
  REACTION_DELETED_POST_AUTHOR_BONUS,
  THREAD_REACTION_CREATED,
  THREAD_REACTION_DELETED,
  COMMUNITY_CREATED,
  USER_JOINED_COMMUNITY,
  PROFILE_EDITED,
  CHANNEL_CREATED,
  CHANNEL_ARCHIVED,
  CHANNEL_DELETED,
  CHANNEL_RESTORED,
  USER_JOINED_CHANNEL,
  SIGNED_IN,
  SIGNED_UP,
  LOGGED_OUT,
} from '../constants';
import type { Job, ReputationEventJobData } from 'shared/bull/types';

export default async (job: Job<ReputationEventJobData>) => {
  const { type, userId, entityId } = job.data;
  debug(`\nnew job: ${job.id}`);
  debug(`\nprocessing sync type: ${type}`);
  debug(`\nprocessing sync entityId: ${entityId}`);

  // if the event came in with bad data, escape
  if (!type || !userId || !entityId) return Promise.resolve();

  // parse event types
  try {
    switch (type) {
      case THREAD_CREATED: /*case THREAD_DELETED:
      case THREAD_DELETED_BY_MODERATION:*/ {
        return await processThreadActivity(type, job.data);
      }
      case MESSAGE_CREATED:
      /*case MESSAGE_DELETED:*/
      case MESSAGE_CREATED_POST_AUTHOR_BONUS: /*case MESSAGE_DELETED_POST_AUTHOR_BONUS:*/ {
        return await processMessageActivity(type, job.data);
      }
      case REACTION_CREATED:
      /*case REACTION_DELETED:*/
      case REACTION_CREATED_POST_AUTHOR_BONUS: /*case REACTION_DELETED_POST_AUTHOR_BONUS:*/ {
        return await processReactionActivity(type, job.data);
      }
      case THREAD_REACTION_CREATED: /*case THREAD_REACTION_DELETED:*/ {
        return await processThreadReactionActivity(type, job.data);
      }
      case SIGNED_UP:
      case SIGNED_IN:
      case LOGGED_OUT:
      case PROFILE_EDITED: {
        return await processProfileActivity(type, job.data);
      }
      case COMMUNITY_CREATED:
      case USER_JOINED_COMMUNITY: {
        return await processCommunityActivity(type, job.data);
      }
      case CHANNEL_CREATED:
      case CHANNEL_RESTORED:
      case CHANNEL_ARCHIVED:
      case USER_JOINED_CHANNEL: {
        return await processChannelActivity(type, job.data);
      }
      default: {
        debug('❌ No sync event type matched');
        return Promise.resolve();
      }
    }
  } catch (err) {
    console.error('❌ Error in job:\n');
    console.error(err);
    Raven.captureException(err);
  }
};
