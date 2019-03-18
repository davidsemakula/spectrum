// @flow
import type { Amplitude } from './';

export const createSetUserProperties = (amplitude: Amplitude) => (
  user: Object
) => {
  if (!amplitude) {
    return;
  }

  const AMPLITUDE_API_KEY =
    process.env.NODE_ENV === 'production'
      ? process.env.AMPLITUDE_API_KEY
      : process.env.AMPLITUDE_API_KEY_DEVELOPMENT;

  if (!AMPLITUDE_API_KEY) {
    return;
  }

  const amplitudePromise = () => {
    return amplitude.getInstance().setUserProperties(user);
  };

  return Promise.all([amplitudePromise()]);
};
