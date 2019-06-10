const debug = require('debug')('sync');
const createWorker = require('../shared/bull/create-worker');
import processActivitySyncEvent from './queues/processActivitySyncEvent';
import { PROCESS_ACTIVITY_SYNC_EVENT } from './constants';

const PORT = process.env.PORT || 3005;

debug('\n✉️ Activity Sync, the activity sync worker, is starting...');
debug('Logging with debug enabled!');

const server = createWorker({
  [PROCESS_ACTIVITY_SYNC_EVENT]: processActivitySyncEvent,
});

debug(
  `🗄 Activity Sync open for business ${(process.env.NODE_ENV === 'production' &&
    `at ${process.env.COMPOSE_REDIS_URL}:${process.env.COMPOSE_REDIS_PORT}`) ||
    'locally'}`
);

server.listen(PORT, 'localhost', () => {
  debug(
    `💉 Healthcheck server running at ${server.address().address}:${
      server.address().port
    }`
  );
});
