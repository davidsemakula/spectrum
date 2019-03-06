// @flow
import cors from 'cors';

export const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production' && !process.env.FORCE_DEV
      ? [
          'https://learn.keyy.org',
          'https://alpha.learn.keyy.org',
          'https://admin.learn.keyy.org',
          'https://hyperion.workers.learn.keyy.org',
          'https://hyperion.alpha.learn.keyy.org',
          process.env.NOW_URL,
        ].filter(Boolean)
      : [/localhost/],
  credentials: true,
};

export default cors(corsOptions);
