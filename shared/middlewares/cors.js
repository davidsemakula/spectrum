// @flow
import cors from 'cors';

export const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production' && !process.env.FORCE_DEV
      ? [
          'https://chat.grindery.io',
          'https://alpha.chat.grindery.io',
          'https://admin.chat.grindery.io',
          'https://hyperion.workers.chat.grindery.io',
          'https://hyperion.alpha.chat.grindery.io',
          process.env.NOW_URL,
        ].filter(Boolean)
      : [/localhost/],
  credentials: true,
};

export default cors(corsOptions);
