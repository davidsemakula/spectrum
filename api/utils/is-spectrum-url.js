// @flow
import { URL } from 'url';
import { RELATIVE_URL } from 'shared/regexps';
const IS_PROD = process.env.NODE_ENV === 'production';

const EXPO_URL = /^https:\/\/auth\.expo\.io\//;

/**
 * Make a URL string is a chat.grindery.io URL
 */
export default (url: string): boolean => {
  if (RELATIVE_URL.test(url)) return true;
  if (EXPO_URL.test(url)) return true;

  try {
    const { hostname, protocol } = new URL(url);
    // hostname might be chat.grindery.io or subdomain.chat.grindery.io, so we use .endsWith
    // We don't just check .contains because otherwise folks could make chat.grindery.io.mydomain.com
    const IS_SPECTRUM_URL = hostname.endsWith('.chat.grindery.io');
    const IS_LOCALHOST = hostname === 'localhost';
    const IS_HTTP = protocol === 'https:' || protocol === 'http:';
    // Make sure the passed redirect URL is a chat.grindery.io one or (in development) localhost
    if (IS_HTTP && (IS_SPECTRUM_URL || (!IS_PROD && IS_LOCALHOST))) {
      return true;
    }
  } catch (err) {
    // Swallow URL parsing errors (when an invalid URL is passed) and redirect to the standard one
    console.error(`Invalid URL ("${url}") passed. Full error:`);
    console.error(err);
  }
  return false;
};
