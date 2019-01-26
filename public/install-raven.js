Raven.config('https://3bd8523edd5d43d7998f9b85562d6924@sentry.io/154812', {
  whitelistUrls: [/chat.grindery.io/, /www.chat.grindery.io/],
}).install();
