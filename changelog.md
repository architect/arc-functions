# Architect Functions changelog

---
Also see: [Architect changelog](https://github.com/architect/architect/blob/master/changelog.md)
---

## [3.15.0] 2021-07-02

### Added 
- New option for getting the full manifest of static assets from the arc.static() function. arc.static('',{fullManifest:true}) returns an object with the full list of files. This is useful for creating a cache manifest for a service worker etc.
---
## [3.14.1] 2021-05-25

### Fixed

- Fixed an issue in sandbox where table names containing other table names would
    get the table definitions confused; thanks @reconbot!

---

## [3.14.0] 2021-05-24

### Added

- New `arc.services()` API for retrieving the service map object for a given app; this object contains metadata associated with all infrastructure or services leveraged by the app

---

## [3.13.12] 2021-05-24

### Changed

- Removed unnecessary console logging for `@events` + `@queues` publishing

---

## [3.13.11] 2021-04-15

### Fixed

- Restored `req.path` convenience parameter missing from HTTP APIs; thanks @crtr0!

---

## [3.13.10] 2021-04-07

### Added

- Session cookie's SameSite value is configurable with ARC_SESSION_SAME_SITE environment variable; thanks @activescott!
- Fixed issue with `arc.tables()` not generating a client for tables with the string `production` in their names in a Sandbox context

---

## [3.13.9] 2021-01-13

### Added

- Added new alias for `arc.tables()._name` to `arc.tables().name`


### Fixed

- Fixed `arc.tables()._name` Sandbox mode returning an array instead of a string; thanks @exalted!

---

## [3.13.8] 2020-11-12

### Changed

- Internal change for JWE token issuance, thanks @lpetre!
- Ensure JWE session helper also uses the ordered last of multiple potential client sessions present in a cookie (if multiple are present)

---

## [3.13.7] 2020-11-05

### Changed

- Sessions helper now uses the ordered last of multiple potential client sessions present in a cookie (if multiple are present)


### Fixed

- Fixed subtle session bug where attempting to clear a session would retain old session data
- Fixed broken legacy `cookie` response param behavior, restoring behavior of being an alias for setting a `set-cookie` header, and not for writing a session

---

## [3.13.6] 2020-11-04

### Fixed

- Fixed rate-limit crashes in legacy `events.publish` call; fixes #300

---

## [3.13.5] 2020-11-03

### Changed

- Updated session test to no longer use legacy session table name
- Updated dependencies


### Fixed

- Handle body parsing `HTTP` APIs with v2.0 Lambda req payloads that include raw JSON; fixes @architect#997, thanks @mawdesley!

---

## [3.13.4] 2020-10-24

### Fixed

- Return errors on local `@events` + `@queues` publishing

---

## [3.13.3] 2020-09-23

### Fixed

- Fixes backward compat for legacy old school tidy Arc response params (e.g. `{ location: '/foo' }`) when used in `HTTP` APIs

---

## [3.13.2] 2020-09-21

### Fixed

- Fixes backward compat for legacy super old school content-type based responses (e.g. `{ html: 'foo' }`) when used in `HTTP` APIs

---

## [3.13.1] 2020-09-16

### Fixed

- Fixed bad call in `http.proxy` alias config

---

## [3.13.0] 2020-09-10

### Added

- Added full forwards compatibility for API Gateway HTTP APIs, including the new v2.0 payload
  - HTTP APIs in v2.0 have undocumented support for some funky response formats, so when in v2.0 mode, non-standard responses are passed through with minimal or no mutation
- Added support for passing along `multiValueHeaders` in responses

---

## [3.12.3] 2020-07-29

### Added

- Enable proxy to use HTTP APIs running in Lambda v1.0 payload format mode

---

## [3.12.2] 2020-07-20

### Added

- Adds support for loading compressed files out of proxy

---

## [3.12.1] 2020-06-16

### Fixed

- Fixed proxy lookup to custom 404 page working locally
- Fixed incorrect filename in proxy 404 error message

---

## [3.12.0] 2020-06-15

### Added

- Adds automatic fingerprint upgrading from non-fingerprinted requests; example:
  - If `@static fingerprint true` is enabled, `<img src=this-is-fine.gif>` will now automatically load `/_static/this-is-fine-abc123.gif`

---

## [3.11.0] 2020-06-07

### Added

- Adds fingerprinting support for pretty URLs and custom 404s in proxy
- Adds support for `ARC_STATIC_PREFIX` env var to provide symmetry with the new `@static prefix` setting
  - The `ARC_STATIC_FOLDER` env var is now considered deprecated, and will be removed in a future (breaking) release
- Added support for leading slashes in build-free templating (e.g. `${arc.static('/this-is-fine.gif')}`)


### Fixed

- Ensures the build-free templating engine always runs, not just when fingerprint is enabled

---

## [3.10.0 - 3.10.1] 2020-05-17

### Added

- Improved default caching behavior for static assets; fixes #273
  - Any assets that don't have `cache-control` explicitly set will now default to using `ETag` in order to improve the reliability of cache invalidation
  - HTML & JSON responses still default to anti-caching headers
- Added path peeking (aka pretty URLs); fixes #269
  - URLs delivered via `proxy` no longer require a trailing slash!
  - Example: to load `/foo/index.html`, you used to have to request `/foo/`
  - Now, if `/foo` is requested, `proxy` will automatically try peeking into `/foo` to see if it contains `/foo/index.html` – if not, it'll 404 as expected
- Added ETag support to Sandbox static asset serving
- Added support for arbitrary static asset config mapping
  - Pass proxy `config.assets` a `static.json`-like static asset object


### Changed

- Internal refactoring: cleaned up old `proxy` code paths


### Fixed

- We now ensure CDNs cannot cache `404` responses

---


## [3.9.1 - 3.9.3] 2020-05-06 - 2020-05-07

### Fixed

- `arc.http.express` POST request could fail if `req.body` was null

---

## [3.9.0] 2020-04-27

### Fixed

- `arc.http.express` POST request could fail if `req.body` was null


### Added

- Adds S3 `ContentEncoding` for `arc.http.proxy` / `arc.http.proxy.read`
  - This means you can now publish and read larger files out of S3 in the compressed format of your choosing!


### Changed

- Updated dependencies


---

## [3.8.3 - 3.8.4] 2020-04-16

### Fixed

- Fixed `arc.http.helpers.url` to now respect `ARC_LOCAL` flag, thanks @filmaj!
- Fixed `arc.tables._name` calls, thanks @filmaj!

---

## [3.8.2] 2020-04-19

### Fixed

- Support for Lambda payload version 2 in session (for API Gateway HTTP APIs)

---

## [3.8.1] 2020-03-24

### Fixed

- Mocks API Gateway's current behavior of not sending a body when response is headers / status code only; fixes #254, /ht @alexbepple
  - (Back in the day it used to default to sending `\n` because reasons.)
- Fixed and improved events.subscribe fallback object (handy for local testing)
- Fixed local predicate for `arc.tables` to ensure `ARC_LOCAL` can speak to live AWS infra

---

## [3.7.7 - 3.8.0] 2020-03-12

### Fixed

- Calling `static()` with the root path (e.g. `static('/')`) now returns `/_static/`; thanks Paul!
- `arc.http.proxy` now supports API Gateway HTTP APIs request/response payload V2

---

## [3.7.5 - 3.7.6] 2020-02-13

### Changed

- Functions now ensures `NODE_ENV` is one of `testing`, `staging`, or `production` (defaulting to `testing`)
- Updated dependencies
- Fix for `arc.tables()` returning `undefined`
- Updates deps


### Fixed

- Improves reliability of using Architect Functions in certain test harnesses that may automatically set `NODE_ENV`

---

## [3.7.2 - 3.7.4] 2020-02-12

### Fixed

- Refactor of internal DynamoDB client instantiation; resolves issues using Functions with some test harnesses (like Jest); fixes #238, thanks @konsumer!
- Fixes issue that caused Sandbox to stall when called via the Architect CLI
- Fixes issue that caused Architect Functions to cause issues in certain test harnesses that may automatically set `NODE_ENV`
- Note: `3.7.1` was an erroneous re-publish of `3.7.0`, please use `3.7.2`

---

## [3.7.0] 2020-02-10

### Added

- Added support for porting express apps with `arc.http.express`

---
## [3.6.0] 2020-02-03

### Added
- Added support for running multiple Sandboxes at the same time
  - No more conflicting events and ports when running multiple simultaneous local Architect projects!
  - Also, you can now manually configure your `@events` port with `ARC_EVENTS_PORT`, and `@tables` port with `ARC_TABLES_PORT`

---

## [3.5.1] 2020-02-02

### Added

- Added fallback event object for direct invocation of event functions using `arc.events.subscribe`


### Changed

- Updated tests for Sandbox soon to be setting `ARC_CLOUDFORMATION` env var
- Updated dependencies

---

## [3.5.0] 2020-01-24

### Added

- `arc.queues.publish` can now accept `groupID` for fifo queues
- erase session with `return {session: {}, location: '/'}` syntax

---

## [3.4.14] 2019-12-13

### Changed

- Allow setting session TTL by passing a SESSION_TTL environment variable with the desired TTL in seconds
- Removes `@architect/parser` dep

## [3.4.13] 2019-12-10

### Changed

- Internal change for JWE token issuance


### Fixed

- Local WebSockets (`arc.ws`) calls no longer always send port `3333`, and to now support custom ports

---

## [3.4.12] 2019-12-01

### Changed

- Uses updated `ARC_WSS_URL` env var format (but retains backwards compatibility)

---

## [3.4.11] 2019-11-28

### Added

- Adds `stagePath` option to `arc.static` for anyone using this with a bare API Gateway configuration
  - Example: `arc.static('foo.png', {stagePath: true})`


### Changed

- `arc.static` now throws an error if the specified asset is not found
- Updated dependencies

---

## [3.4.9 - 3.4.10] 2019-11-28

### Changed

- Updated dependencies


### Fixed

- Fixes issue where `events.publish` may sometimes fail with > 10 topics; thanks @dduran1967!

---

## [3.5.8] 2019-11-04

### Changed

- Internal / testing changes only

---

## [3.5.7] 2019-11-01

### Added

- `arc.http.proxy` looks for default `index.html` when `ARC_STATIC_SPA=false`

---

## [3.5.5 - 3.5.6] 2019-10-25

### Fixed

- Fixes `arc.ws.send` for apps packaged with `@architect/package` **1.0.50** or later. AWS changed the `ApiGatewayMangementApi.postToConnection` interface paramter `endpoint` to no longer be suffixed with `@connections`
- Adds `data.reflect` to get table names

```javascript
let arc = require('@architect/functions')

// elsewhere in your async function handler:
let data = await arc.tables()
let names = await data.reflect() // returns {arcfilename: 'generated-tablename'}
```

- Adds anti-caching and body parsing `application/vnd.api+json`; resolves #141, thanks @jkarsrud!

---

## [3.4.4] 2019-10-15

### Fixed

- Fixes broken response when bucket is not configured as root proxy


### Changed

- Improves error states for missing static configs, 404s, etc.

---

## [3.4.3] 2019-10-11

### Changed

- Updated dependencies

---

## [3.4.0 - 3.4.2] 2019-10-10

### Added

- Added support for `@static fingerprint true` in root spa / proxy requests
  - This enables Architect projects to deliver fully fingerprinted static assets while also ensuring that each file is appropriately cached by clients and network infra
  - Also includes support for build-free calls between your fingerprinted static assets
    - Example: in `public/index.html`, use the following syntax to automatically replace the local / human-friendly filename reference to the deployed fingerprinted filename:
    - `${arc.static('image.png')}` will be automatically replaced by `image-a1c3e5.png`
    - Or `${STATIC('image.png')}` (which is the same thing, but shoutier)
    - Note: although those look like JS template literal placeholders, they're intended to live inside non-executed, static files within `public/` (or `@static folder foo`)


### Changed

- Updated dependencies
- Changed static manifest loader to be more bundler friendly


### Fixed

- Fixed issue that may prevent `repl` from working with more recent versions of Functions
- Add anti-caching headers to `sandbox` 404 response

---

## [3.3.15] 2019-09-26

### Added

- Added more consistent and regular entry for proxy: `http.proxy`
  - This is non-breaking: `http.proxy.public`, `http.proxy.read`, and even the older `proxy.public` methods are still available, although are deprecated. We suggest moving to them.
  - `http.proxy` does the same as what `http.proxy.public` used to do; since the vast majority of use was around `http.proxy.public` and not `http.proxy.read`, it didn't make sense to have such a verbose method signature
- `http.proxy`'s SPA setting can now be disabled with an env var – `ARC_STATIC_SPA = 'false'` (where `false` is a string, not a bool)
  - You can still disable it via configuration as well (`{spa:false}`)
- Lots and lots of tests around `http.proxy`

### Fixed

- Better 404 / file missing handling in `sandbox` when using `http.proxy` (or loading static assets without `@http get /` specified)

---

## [3.3.14] 2019-09-25

### Changed

- Updated deps

### Fixed

- Restored `http.proxy.public` settings that were erroneously removed in a previous update
  - `bucket.staging`, `bucket.production`, `bucket.folder`, and `cacheControl` are now restored
- Fixes a proxy issue in Architect 5 / LTS projects where SPA requests for pages would not have loaded correctly

---

## [3.3.13] 2019-09-24

### Fixed

- Improved detection of `proxy` and `ws` when running locally with NODE_ENV not set to `testing`, and `ARC_LOCAL` set

---

## [3.3.12] 2019-09-13

### Fixed

- `http.proxy` now correctly responds to requests if your environment includes an `ARC_STATIC_FOLDER` env var

---

## [3.3.11] 2019-09-09

### Changed

- Internal change to normalize response shapes from `http.proxy.public` + `http.proxy.read`


### Fixed

- Fixes issue where binary assets delivered via `sandbox` / root may not be properly encoded
- Fixes issue where `http.proxy.public` + `http.proxy.read` may not have delivered correctly formatted responses in Architect 5
- Fixed minor issue in `ARC_HTTP` env var check

---

## [3.3.9 - 3.3.10] 2019-09-09

### Added

- Adds `ARC_HTTP` env var check to Arc v5 response formatter

---

## [3.3.8] 2019-09-03

### Fixed

- Fixes `arc.http` / `arc.http.async` responses to `/{proxy+}` requests

---

## [3.3.7] 2019-08-28

### Changed

- Makes passing config to `arc.http.proxy` entirely optional

---

## [3.3.5 - 3.3.6] 2019-08-27

### Added

- Added Architect 6 compatibility to `arc.http.async`, the new method name for `async/await` middleware
  - All `async/await` functions run through `arc.http.async` now automatically have client sessions attached and decoded, parsed bodes (if applicable)
  - Learn more about [upgrading to Arc 6 + `arc.http.async` here](https://arc.codes/guides/upgrade#arc-http-async)
- Added ability to set custom headers on any `arc.http.proxy` request


### Changed

- `arc.http.middleware` (formerly `arc.middleware`) is now `arc.http.async`
  - These methods are functionally the same
  - The old aliases will remain for a while to come, but we suggest moving any deprecated calls over to their new equivalents by mid-2020


### Fixed

- Fixed minor issue where status code of `302` couldn't be overridden when using both `location` and `statusCode` (or `status`, or `code`) response params
- Fixed bug preventing emitting binary assets via `arc.http.proxy`
- Fixed munged headers and content-type in proxy plugins, fixes @architect/architect#432


---

## [3.3.3 - 3.3.4] 2019-08-22

### Fixed

- Fixed `arc.static()` (and deprecated `arc.http.helpers.static()`) calls in Arc 6, fixes #59 /ht @mikemaccana
- Fixed sometimes-broken paths to API gateway

---

## [3.3.1 - 3.3.2] 2019-08-20

### Fixed

- Fixed `arc.tables()` calls in Arc 6

---

## [3.3.0] 2019-08-12

### Added

- Support for Architect 6
  - Includes complete compatibility for Architect 4 + 5 users:
    - If already using Functions, everything should just work!
    - If using Arc 5 dependency-free, you can now drop your existing responses into Architect Functions's `res()` and everything should be solid; no signature changes should be required
- Takes over all responsibilities of now-deprecated `@architect/data`
  - Previous data calls can be accessed with `arc.tables()`
- Responses now include the same content type aware `Cache-Control` defaults as found in Architect 5
  - As always, they're able to be overriden with `cacheControl` param (or `headers['Cache-Control']`)

### Changed

- Hopefully nothing breaking – please send feedback on the RC!
  - 3.3 RC: https://github.com/architect/functions/issues/57
  - Slack: https://architecture-as-text.slack.com

---

## [3.2.2] 2019-07-11

### Added

- Including a `headers` object in your `arc.http` response will now set custom headers
- `SESSION_DOMAIN` variable now supported in `jwe` sessions
- `context` is now passed onto each middleware function

---

## [3.2.1] 2019-06-26

### Changed

- Backwards-compatible refactoring of `events` publishing in preparation for Architect 6 service discovery

---

## [3.2.0] 2019-06-14

### Added

- For additional control of your user sessions, you may now define the [cookie Domain attribute](https://tools.ietf.org/html/rfc6265#section-5.2.3)
  - Because this needs to be set consistently across your app's usage of session, set this via the `SESSION_DOMAIN` environment variable

---

## [3.1.0] 2019-06-05

### Added

- This release is all about improving static asset access!
  - Static asset fingerprinting is now built into the static asset helper!
    - Enable file fingerprinting in your project by adding `fingerprint true` to your Arc manifests's `@static` pramga
    - If enabled, requesting `styles.css` will return the proper fingerprinted URL (e.g. `https://your-bucket.s3.us-west-1.amazonaws.com/styles-1e25d663f6.css`)
  - The static asset helper is now a first-class method accessible at: `arc.static('filename.ext')`
    - File path are still relative to your `public/` dir
    - Legacy method `arc.http.helpers.static('filename.ext')` will continue to be supported
  - Static helper tests

---

## [3.0.8] 2019-05-20

### Fixed

- `proxy.read()` calls without `config.bucket` specified work correctly again, fixes #38

---

## [3.0.7] 2019-05-11

### Added

- `arc.http.helpers.static()` now uses `ARC_STATIC_BUCKET` and `ARC_STATIC_FOLDER` (as introduced in 2.0.16 for `arc.proxy.read()`), fixes #37

### Fixed

- Also improves S3 URL handling in `arc.http.helpers.static()`, partially addressing @architect/architect#375 (S3's late-2020 URL format support change)

### Changed

- Updated dependencies

---

## [3.0.6] 2019-05-09

### Added

- Adds support for sending `delaySeconds` parameter on queue publish, closes #36 /ht @bardbachmann

---

## [3.0.3 - 3.0.5] - 2019-04-19

### Added

- `arc.events.subscribe` will now accept an `AsyncFunction`

### Fixed

- Removes trailing slash from `arc.http.helpers.static()` that breaks URLs when working locally

### Changed

- Updated dependencies


---

## [3.0.2] - 2019-04-10

### Fixed

- Fixes local sandbox publishing events/queues bug introduced in 2.0.8

---

## [3.0.1] - 2019-04-04

### Added

- Enables both text and binary file transit in newly provisioned Arc apps
- This is NOT a breaking update if you aren't using `proxy.public()`
  - However, if you use `proxy.public()`, this is a breaking update!
  - In order to enable binary assets support, Arc Functions now encodes files being emitted via `proxy.public()` for use in Architect 5.6+ apps
  - If you'd like your existing app that uses `proxy.public()` to serve binary assets, you'll need to re-create your API (or hang tight until we release our forthcoming API migration tool)

### Fixed

- `get /` encoding is now properly set when using `config.bucket.folder`

---

## [2.0.17 - 2.0.19] - 2019-04-02

### Fixed

- Added checks to ensure bucket exists in `proxy.public()`
- Requests to unknown files via `proxy.public()` now return a proper 404 response, and not 200 / `undefined`
- Fixes proxy path prefix check in testing environment
- Found and removed some junk files in the NPM package

---

## [2.0.16] - 2019-03-27

### Added

- Adds `ARC_STATIC_BUCKET` + `ARC_STATIC_FOLDER` env vars for config-reduced `proxy.public()` reads

### Fixed

- In `proxy.public()` config, the bucket folder prefix is now respected when working locally

---

## [2.0.15] - 2019-03-13

### Added

- Cache-control header support for `proxy.public`; if not specified, defaults to:
  - HTML + JSON: `no-cache, no-store, must-revalidate, max-age=0, s-maxage=0`
  - Everything else: `max-age=86400`

### Changed

- Updated dependencies

---

## [2.0.13-14] - 2019-03-08

### Fixed

- Fixed local env check in `queues.publish` /ht @tobytailor

---

## [2.0.1-2.0.11] - 2019-02-26

### Added

- proxy allows for configurable s3 bucket and folder
- proxied files now return `etag`
- `arc.proxy.public` configuration:
  - `spa` - boolean, load `index.html` at any folder depth
  - `ssr` - path string of module to load or function for overriding `/index.html`
  - `alias` - alias paths path (eg. `{'/css':'/styles/index.scss'}`)
  - `plugins` - per filetype transform plugin pipelines

The companion transform plugins aim to help developers make the transition to browser native esmodules:

- `@architect/proxy-plugin-jsx` transpiles jsx to preact/react
- `@architect/proxy-plugin-tsx` strips types and transpiles jsx to preact/react
- `@architect/proxy-plugin-mjs-urls` adds `/staging` or `/production` to imports urls
- `@architect/proxy-plugin-bare-imports` enable bare imports with browser esm

And for fun:

- `@architect/proxy-plugin-md` markdown to html
- `@architect/proxy-plugin-sass` sass/scss

> If you think we're missing a plugin please don't hesitate to ask in the issue tracker!

[Complete example project code here.](https://github.com/arc-repos/arc-example-proxy-plugins)

---

## [2.0.0] - 2019-02-03

### Removed

- arc.js
- arc.css
- arc.html
- arc.text
- arc.xml
- arc.json

---

## [1.13.0] - 2019-01-31

### Added

- New `arc.proxy` wip proxy get-index to /public when running locally and s3 when running on aws

```javascript
// exmaple usage in a ws-connected lambda
let arc = require('@architect/functions')

exports.handler = arc.proxy.public()
```

---

## [1.12.0] - 2019-01-16

### Added

- New `arc.ws` wip progress for sending web socket messages locally and in the cloud

```javascript
// exmaple usage in a ws-connected lambda
let WebSocket = require('@architect/functions').ws

exports.handler = async function WebSocketConnected(event) {
  let ws = new WebSocket(event)
  await ws.send('pong')
  return {
    statusCode: 200
  }
}
```

---

## [1.11.1] - 2018-12-15

### Added

- New `arc.middleware` await-based middleware API, see [the Architect Documentation](https://arc.codes/reference/middleware)
