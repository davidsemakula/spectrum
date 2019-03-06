import { Route } from 'react-router';
import { CLIENT_MAIN_DOMAIN } from './api/constants';

// Key can be a slug or a domain name. Must be all lowercased.
// If slug is used, the final domain will be SLUG.learn.keyy.org
// No need to add alias if desired slug is the same as community slug,
// like `startup-framework`
const COMMUNITY_DOMAIN_ALIASES = {
  suf: 'startup-framework',
  'suf.inboundlabs.co': 'startup-framework',
};

class CommunityHostHelper {
  constructor(ssrHost = '') {
    this.setSsrHost(ssrHost);
  }
  setSsrHost(ssrHost) {
    this.ssrHost = ssrHost;
  }
  getDomainCommunitySlug() {
    const currentHost = global.location
      ? global.location.host.toLowerCase()
      : this.ssrHost;
    if (currentHost in COMMUNITY_DOMAIN_ALIASES) {
      return COMMUNITY_DOMAIN_ALIASES[currentHost];
    }
    if (
      !currentHost ||
      !currentHost.endsWith(CLIENT_MAIN_DOMAIN) ||
      currentHost === CLIENT_MAIN_DOMAIN
    ) {
      // On main domain or test domain
      return '';
    }
    const domainPart = currentHost
      .slice(0, currentHost.length - CLIENT_MAIN_DOMAIN.length - 1)
      .split('.');
    const domainPartLast = domainPart[domainPart.length - 1];
    if (domainPartLast === 'workers') {
      return '';
    }
    return COMMUNITY_DOMAIN_ALIASES[domainPartLast] || domainPartLast;
  }
  adaptCommunityRoutes(routeWrapper) {
    const routes = routeWrapper.props.children || [routeWrapper];
    const communitySlug = this.getDomainCommunitySlug();
    if (!communitySlug) {
      return routes;
    }
    const pathRe = new RegExp(`^\\/${communitySlug}(\\/|$)`);
    const wrapHistory = h => {
      const installHack = (keys, funcFactory) => {
        if (typeof keys === 'string') {
          keys = [keys];
        }
        for (const key of keys) {
          const oldFunc = h[key];
          if (!oldFunc.__hasDomainHack) {
            h[key] = funcFactory(oldFunc);
            h[key].__hasDomainHack = true;
          }
        }
      };
      const patchLocation = location => {
        if (typeof location === 'string') {
          return location.replace(pathRe, '/');
        }
        return {
          ...location,
          pathname: location.pathname.replace(pathRe, '/'),
        };
      };
      installHack(['createHref', 'replace', 'push'], oldFunc => {
        return function(location, ...args) {
          return oldFunc.call(this, patchLocation(location), ...args);
        };
      });
      return h;
    };
    const wrapComponent = Component => {
      if (!Component) {
        return undefined;
      }
      return args => {
        args = {
          ...args,
          history: wrapHistory(args.history),
        };
        args.match.params.communitySlug = communitySlug;
        return <Component {...args} />;
      };
    };
    const ret = routes.map(route => {
      const path = route.props.path.replace(/:communitySlug(\/|$)/, '');
      const component = wrapComponent(route.props.component);
      return <Route {...{ path, component }} />;
    });
    return ret;
  }
}

export default CommunityHostHelper;
