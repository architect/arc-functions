let read = require('./read')
let errors = require('../errors')

/**
 * arc.http.proxy
 *
 * Primary interface for reading static assets out of S3
 *
 * @param config - object, for configuration
 * @param config.alias - object, map of root rel URLs to map to fully qualified root rel URLs
 * @param config.assets - object, map of local, unfingerprinted filenames to fingerprinted filenames
 * @param config.bucket - object, {staging, production} override the s3 bucket names
 * @param config.bucket.staging - object, {staging, production} override the s3 bucket names
 * @param config.bucket.production - object, {staging, production} override the s3 bucket names
 * @param config.bucket.folder - string, bucket folder
 * @param config.cacheControl - string, set a custom Cache-Control max-age header value
 * @param config.plugins - object, configure proxy-plugin-* transforms per file extension
 * @param config.spa - boolean, forces index.html no matter the folder depth
 *
 * @returns HTTPLambda - an HTTP Lambda function that proxies calls to S3
 */
function proxy (config={}) {
  return async function httpProxy (req) {

    let { ARC_STATIC_BUCKET, ARC_STATIC_SPA, NODE_ENV } = process.env

    let isProduction = NODE_ENV === 'production'
    let path = req.path || req.rawPath
    let isFolder = path.split('/').pop().indexOf('.') === -1
    let Key // Assigned below

    /**
     * Bucket config
     */
    let configBucket = config.bucket
    let bucketSetting = isProduction
      ? configBucket && configBucket['production']
      : configBucket && configBucket['staging']
    // Ok, all that out of the way, let's set the actual bucket, eh?
    let Bucket = ARC_STATIC_BUCKET || bucketSetting
    if (!Bucket) {
      return errors.proxyConfig
    }

    /**
     * Configure SPA + set up the file to be requested
     */
    let spa = ARC_STATIC_SPA === 'false'
      ? false
      : config && config.spa
    if (!spa) config.spa = false
    if (spa) {
      // If SPA: force index.html
      Key = isFolder ? 'index.html' : path.substring(1)
    }
    else {
      // Return index.html for root, otherwise pass the path
      let last = path.split('/').filter(Boolean).pop()
      let isFile = last ? last.includes('.') : false
      let isRoot = path === '/'

      Key = isRoot? 'index.html' : path.substring(1) // Always remove leading slash

      // Append default index.html to requests to folder paths
      if (isRoot === false && isFile === false) {
        Key = `${Key.replace(/\/$/, '')}/index.html`
      }
    }

    /**
     * Alias
     *   Allows a Key to be manually overridden
     */
    let aliasing = config && config.alias && config.alias.hasOwnProperty(path)
    if (aliasing) {
      Key = config.alias[path].substring(1) // Always remove leading slash
    }

    /**
     * Strip `staging/` and `production/` from HTTP API req urls
     */
    if (Key.startsWith('staging/') ||
        Key.startsWith('production/') ||
        Key.startsWith('_static/')) {
      Key = Key.replace('staging/', '').replace('production/', '').replace('_static/', '')
    }

    // Normalize if-none-match header to lower case; it differs between environments
    let find = k => k.toLowerCase() === 'if-none-match'
    let IfNoneMatch = req.headers && req.headers[Object.keys(req.headers).find(find)]

    // Ensure response shape is correct for proxy SPA responses
    let isProxy = req.resource === '/{proxy+}' || !!req.rawPath

    return await read({ Key, Bucket, IfNoneMatch, isFolder, isProxy, config, request: req })
  }
}

module.exports = {
  proxy,  // Default
  read    // Read a specific file
}
