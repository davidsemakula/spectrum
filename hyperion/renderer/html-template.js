// @flow
import fs from 'fs';
import path from 'path';
import { html } from 'common-tags';
import serialize from 'serialize-javascript';

// Match main.asdf123.js in production mode or bundle.js in dev mode
const mainBundleRegex = /(main|bundle)\.(?:.*\.)?js$/;

let bundles;
try {
  bundles = fs.readdirSync(path.join(__dirname, '../../build/static/js'));
} catch (err) {
  throw new Error(
    'It looks like you didn\'t run "yarn run dev:web" or "yarn run build:web" before starting hyperion. Please wait until either of them completes before starting hyperion.'
  );
}

// Get the main bundle filename
const mainBundle = bundles.find(bundle => mainBundleRegex.test(bundle));
if (!mainBundle) {
  throw new Error(
    'It looks like you didn\'t run "yarn run dev:web" or "yarn run build:web" before starting hyperion. Please wait until either of them completes before starting hyperion.'
  );
}

export const createScriptTag = ({ src }: { src: string }) =>
  `<script defer="defer" src="${src}"></script>`;

export const getHeader = ({
  metaTags,
  nonce,
}: {
  metaTags: string,
  nonce: string,
}) => {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="mask-icon" href="/img/pinned-tab.svg" color="#171A21" />
        <meta name="theme-color" content="#171A21" />
        <link rel="manifest" href="/manifest.json" />
        <meta property="og:site_name" content="Keyy" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@withgrindery" />
        <meta name="twitter:image:alt" content="Where communities are built" />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="57x57"
          href="/img/apple-icon-57x57-precomposed.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="72x72"
          href="/img/apple-icon-72x72-precomposed.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="114x114"
          href="/img/apple-icon-114x114-precomposed.png"
        />
        <link
          rel="apple-touch-icon-precomposed"
          sizes="144x144"
          href="/img/apple-icon-144x144-precomposed.png"
        />
        ${metaTags}
        <script type="text/javascript" nonce="${nonce}">
          !(function(e, a, t, n, g, c, o) {
            (e.GoogleAnalyticsObject = g),
              (e.ga =
                e.ga ||
                function() {
                  (e.ga.q = e.ga.q || []).push(arguments);
                }),
              (e.ga.l = 1 * new Date()),
              (c = a.createElement(t)),
              (o = a.getElementsByTagName(t)[0]),
              (c.defer = 1),
              (c.src = 'https://www.google-analytics.com/analytics.js'),
              o.parentNode.insertBefore(c, o);
          })(window, document, 'script', 0, 'ga'),
            ga('create', 'UA-92673909-1', 'auto'),
            ga('send', 'pageview'),
            ga('set', 'anonymizeIp', true);
        </script>
        <script nonce="${nonce}" type="text/javascript">
          (function(e, t) {
            var n = e.amplitude || { _q: [], _iq: {} };
            var r = t.createElement('script');
            r.type = 'text/javascript';
            r.async = true;
            r.src = 'https://cdn.amplitude.com/libs/amplitude-4.2.1-min.gz.js';
            r.onload = function() {
              if (e.amplitude.runQueuedFunctions) {
                e.amplitude.runQueuedFunctions();
              } else {
                console.error('[Amplitude] Error: could not load SDK');
              }
            };
            var i = t.getElementsByTagName('script')[0];
            i.parentNode.insertBefore(r, i);
            function s(e, t) {
              e.prototype[t] = function() {
                this._q.push(
                  [t].concat(Array.prototype.slice.call(arguments, 0))
                );
                return this;
              };
            }
            var o = function() {
              this._q = [];
              return this;
            };
            var a = [
              'add',
              'append',
              'clearAll',
              'prepend',
              'set',
              'setOnce',
              'unset',
            ];
            for (var u = 0; u < a.length; u++) {
              s(o, a[u]);
            }
            n.Identify = o;
            var c = function() {
              this._q = [];
              return this;
            };
            var l = [
              'setProductId',
              'setQuantity',
              'setPrice',
              'setRevenueType',
              'setEventProperties',
            ];
            for (var p = 0; p < l.length; p++) {
              s(c, l[p]);
            }
            n.Revenue = c;
            var d = [
              'init',
              'logEvent',
              'logRevenue',
              'setUserId',
              'setUserProperties',
              'setOptOut',
              'setVersionName',
              'setDomain',
              'setDeviceId',
              'setGlobalUserProperties',
              'identify',
              'clearUserProperties',
              'setGroup',
              'logRevenueV2',
              'regenerateDeviceId',
              'logEventWithTimestamp',
              'logEventWithGroups',
              'setSessionId',
              'resetSessionId',
            ];
            function v(e) {
              function t(t) {
                e[t] = function() {
                  e._q.push(
                    [t].concat(Array.prototype.slice.call(arguments, 0))
                  );
                };
              }
              for (var n = 0; n < d.length; n++) {
                t(d[n]);
              }
            }
            v(n);
            n.getInstance = function(e) {
              e = (!e || e.length === 0
                ? '$default_instance'
                : e
              ).toLowerCase();
              if (!n._iq.hasOwnProperty(e)) {
                n._iq[e] = { _q: [] };
                v(n._iq[e]);
              }
              return n._iq[e];
            };
            e.amplitude = n;
          })(window, document);
        </script>
        <!-- Hotjar Tracking Code for https://learn.keyy.org -->
        <script>
          (function(h, o, t, j, a, r) {
            h.hj =
              h.hj ||
              function() {
                (h.hj.q = h.hj.q || []).push(arguments);
              };
            h._hjSettings = { hjid: 1197624, hjsv: 6 };
            a = o.getElementsByTagName('head')[0];
            r = o.createElement('script');
            r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
          })(
            window,
            document,
            'https://static.hotjar.com/c/hotjar-',
            '.js?sv='
          );
        </script>
        <!-- Start of HubSpot Embed Code -->
        <script
          type="text/javascript"
          id="hs-script-loader"
          async
          defer
          src="//js.hs-scripts.com/470535.js"
        ></script>
        <!-- End of HubSpot Embed Code -->
        <!-- Start LuckyOrange Tracking ---->
        <script type="text/javascript">
          window.__lo_site_id = 141389;

          (function() {
            var wa = document.createElement('script');
            wa.type = 'text/javascript';
            wa.async = true;
            wa.src = 'https://d10lpsik1i8c69.cloudfront.net/w.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(wa, s);
          })();
        </script>
        <!-- End LuckyOrange -->
        <!-- Facebook Pixel Code -->
        <script>
          !(function(f, b, e, v, n, t, s) {
            if (f.fbq) return;
            n = f.fbq = function() {
              n.callMethod
                ? n.callMethod.apply(n, arguments)
                : n.queue.push(arguments);
            };
            if (!f._fbq) f._fbq = n;
            n.push = n;
            n.loaded = !0;
            n.version = '2.0';
            n.queue = [];
            t = b.createElement(e);
            t.async = !0;
            t.src = v;
            s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s);
          })(
            window,
            document,
            'script',
            'https://connect.facebook.net/en_US/fbevents.js'
          );
          fbq('init', '350063548931409');
          fbq('track', 'PageView');
        </script>
        <noscript
          ><img
            height="1"
            width="1"
            style="display:none"
            src="https://www.facebook.com/tr?id=350063548931409&ev=PageView&noscript=1"
        /></noscript>
        <!-- End Facebook Pixel Code -->
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=UA-37080412-3"
        ></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag() {
            dataLayer.push(arguments);
          }
          gtag('js', new Date());

          gtag('config', 'UA-37080412-3');
        </script>
        <!-- end GA -->
        <!-- Adroll Pixel - No-EU with no GDPR -->
        <script type="text/javascript">
          adroll_adv_id = 'K2LAE7GLABAZNEGQYJQ6EM';
          adroll_pix_id = '7CPCGD6JORGJPD46RIYNJY';

          (function() {
            var _onload = function() {
              if (
                document.readyState &&
                !/loaded|complete/.test(document.readyState)
              ) {
                setTimeout(_onload, 10);
                return;
              }
              if (!window.__adroll_loaded) {
                __adroll_loaded = true;
                setTimeout(_onload, 50);
                return;
              }
              var scr = document.createElement('script');
              var host =
                'https:' == document.location.protocol
                  ? 'https://s.adroll.com'
                  : 'http://a.adroll.com';
              scr.setAttribute('async', 'true');
              scr.type = 'text/javascript';
              scr.src = host + '/j/roundtrip.js';
              (
                (document.getElementsByTagName('head') || [null])[0] ||
                document.getElementsByTagName('script')[0].parentNode
              ).appendChild(scr);
            };
            if (window.addEventListener) {
              window.addEventListener('load', _onload, false);
            } else {
              window.attachEvent('onload', _onload);
            }
          })();
        </script>
        <!-- end Adroll -->
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `;
};

export const getFooter = ({
  state,
  data,
  bundles,
  nonce,
}: {
  state: Object,
  data: Object,
  bundles: Array<string>,
  nonce: string,
}) => {
  return html`</div>
      <script defer="defer" src="https://cdn.ravenjs.com/3.14.0/raven.min.js" crossorigin="anonymous"></script>
      <script defer="defer" src="/install-raven.js"></script>
      <script nonce="${nonce}">window.__SERVER_STATE__=${serialize(
    state
  )}</script>
      <script nonce="${nonce}">window.__DATA__=${serialize(data)}</script>
      <script defer="defer" type="text/javascript" src="https://cdn.polyfill.io/v2/polyfill.min.js?features=default,Array.prototype.find,Symbol.iterator"></script>
      <script type="text/javascript" src="/static/js/bootstrap.js"></script>
      ${bundles.map(src => createScriptTag({ src }))}
      ${createScriptTag({ src: `/static/js/${mainBundle}` })}
    </body>
    </html>
  `;
};
