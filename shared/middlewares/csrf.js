// @flow
import hostValidation from 'host-validation';

// NOTE(@mxstbr):
// - Host header only contains the domain, so something like 'build-api-asdf123.now.sh' or 'chat.grindery.io'
// - Referer header contains the entire URL, so something like 'https://build-api-asdf123.now.sh/forward' or 'https://chat.grindery.io/forward'
// That means we have to check the Host slightly differently from the Referer to avoid things like 'my-domain-chat.grindery.io' to be able to hack our users

// Hosts, without http(s):// and paths
const trustedHosts = [
  process.env.NOW_URL &&
    new RegExp(`^${process.env.NOW_URL.replace('https://', '')}$`),
  /^chat\.grindery\.io$/,
  // All subdomains
  /^.*\.chat\.grindery\.io$/,
].filter(Boolean);

// Referers, with http(s):// and paths
const trustedReferers = [
  process.env.NOW_URL && new RegExp(`^${process.env.NOW_URL}($|\/.*)`),
  /^https:\/\/chat\.grindery\.io($|\/.*)/,
  // All subdomains
  /^https:\/\/.*\.chat\.grindery\.io($|\/.*)/,
].filter(Boolean);

export default hostValidation({
  hosts: trustedHosts,
  referers: trustedReferers,
  mode: 'either',
});
