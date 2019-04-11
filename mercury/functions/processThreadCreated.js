// @flow
import { events } from '../../shared/analytics';

const debug = require('debug')('mercury:queue:process-thread-created');
import {
  updateReputation,
  updateUserReputation,
} from '../models/usersCommunities';
import { getThread } from '../models/thread';
import { getThreadCount } from '../models/user';
import {
  THREAD_CREATED,
  THREAD_CREATED_SCORE,
  THREADS_CREATED_1,
  THREADS_CREATED_10,
  THREADS_CREATED_5,
  THREADS_CREATED_SCORE_1,
  THREADS_CREATED_SCORE_10,
  THREADS_CREATED_SCORE_5,
} from '../constants';
import type { ReputationEventJobData } from 'shared/bull/types';
import { trackQueue } from 'shared/bull/queues';

export default async (data: ReputationEventJobData) => {
  // entityId represents the threadId
  const { userId, entityId } = data;
  const { communityId } = await getThread(entityId);

  let promiseArray = [];

  const numCreatedThreads = await getThreadCount(userId);

  let repEventScore = null;

  if (![1, 5, 10].includes(numCreatedThreads)) {
    promiseArray.push(
      updateReputation(
        userId,
        communityId,
        THREAD_CREATED_SCORE,
        THREAD_CREATED
      )
    );
  }

  if (numCreatedThreads >= 10) {
    promiseArray.push(
      updateUserReputation(userId, THREADS_CREATED_SCORE_10, THREADS_CREATED_10)
    );

    if (numCreatedThreads === 10) {
      repEventScore = THREADS_CREATED_SCORE_10;
    }
  } else if (numCreatedThreads >= 5) {
    promiseArray.push(
      updateUserReputation(userId, THREADS_CREATED_SCORE_5, THREADS_CREATED_5)
    );
    if (numCreatedThreads === 5) {
      repEventScore = THREADS_CREATED_SCORE_5;
    }
  } else if (numCreatedThreads >= 1) {
    promiseArray.push(
      updateUserReputation(userId, THREADS_CREATED_SCORE_1, THREADS_CREATED_1)
    );

    if (numCreatedThreads === 1) {
      repEventScore = THREADS_CREATED_SCORE_1;
    }
  } else {
    promiseArray.push(Promise.resolve());
  }

  if (repEventScore) {
    trackQueue.add({
      userId,
      event: events.TOTAL_THREADS_CREATED,
      context: {
        userId,
        threshold: numCreatedThreads,
        score: repEventScore,
      },
    });
  }

  debug(`Processing thread created reputation event`);
  debug(`Got communityId: ${communityId}`);
  return Promise.all(promiseArray);
};
