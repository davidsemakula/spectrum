// @flow
import { createAmplitudeHelpers } from 'shared/clients/analytics';
import { isDesktopApp } from 'src/helpers/desktop-app-utils';

const {
  events,
  track,
  setUser,
  unsetUser,
  transformations,
  setUserProperties,
} = createAmplitudeHelpers({
  amplitude: window.amplitude,
  client: isDesktopApp() ? 'desktop' : 'web',
});

export {
  events,
  track,
  setUser,
  unsetUser,
  transformations,
  setUserProperties,
};
