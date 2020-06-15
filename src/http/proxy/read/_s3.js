let { existsSync, readFileSync } = require('fs')
let { extname, join } = require('path')
let mime = require('mime-types')
let aws = require('aws-sdk')

let binaryTypes = require('../../helpers/binary-types')
let { httpError } = require('../../errors')
let transform = require('../format/transform') // Soon to be deprecated
let templatizeResponse = require('../format/templatize')
let normalizeResponse = require('../format/response')
let pretty = require('./_pretty')

/**
 * arc.http.proxy.read
 *
 * Reads a file from S3, resolving an HTTP Lambda friendly payload
 *
 * @param {Object} params
 * @param {String} params.Key
 * @param {String} params.Bucket
 * @param {String} params.IfNoneMatch
 * @param {String} params.isFolder
 * @param {String} params.isProxy
 * @param {Object} params.config
 * @returns {Object} {statusCode, headers, body}
 */
module.exports = async function readS3 (params) {

  let { Bucket, Key, IfNoneMatch, isFolder, isProxy, config, request } = params
  let { ARC_STATIC_PREFIX, ARC_STATIC_FOLDER } = process.env
  let prefix = ARC_STATIC_PREFIX || ARC_STATIC_FOLDER || config.bucket && config.bucket.folder
  let assets = config.assets || staticAssets
  let headers = {}
  let response = {}

  try {
    // If client sends If-None-Match, use it in S3 getObject params
    let matchedETag = false
    let s3 = new aws.S3

    // Try to interpolate HTML/JSON requests to fingerprinted filenames
    let contentType = mime.contentType(extname(Key))
    let capture = [ 'text/html', 'application/json' ]
    let isCaptured = capture.some(type => contentType.includes(type))
    if (assets && assets[Key] && isCaptured) {
      // Not necessary to flag response formatter for anti-caching
      // Those headers are already set in S3 file metadata
      Key = assets[Key]
    }

    // Check for progressive bundle upgrade request
    if (assets && assets[Key] && isCaptured === false) {
      return {
        statusCode: 302,
        headers: {
          location: `/${ assets[Key] }` 
        }
      }
    }

    /**
     * Folder prefix
     *   Enables a bucket folder at root to be specified
     */
    if (prefix) {
      Key = `${prefix}/${Key}`
    }

    let options = { Bucket, Key }
    if (IfNoneMatch) {
      options.IfNoneMatch = IfNoneMatch
    }

    let result = await s3.getObject(options).promise().catch(err => {
      // ETag matches (getObject error code of NotModified), so don't transit the whole file
      if (err.code === 'NotModified') {
        matchedETag = true
        headers.ETag = IfNoneMatch
        response = {
          statusCode: 304,
          headers
        }
      }
      else {
        // Important: do not swallow this error otherwise!
        throw err
      }
    })

    // No ETag found, return the blob
    if (!matchedETag) {
      let contentEncoding = result.ContentEncoding
      let isBinary = binaryTypes.some(type => result.ContentType.includes(type) || contentType.includes(type))

      // Transform first to allow for any proxy plugin mutations
      response = transform({
        Key,
        config,
        isBinary,
        defaults: {
          headers,
          body: result.Body
        }
      })

      // Handle templating
      response = templatizeResponse({
        isBinary,
        assets,
        request,
        response
      })

      // Normalize response
      response = normalizeResponse({
        response,
        result,
        Key,
        isProxy,
        config
      })

      // Add ETag
      response.headers.ETag = result.ETag
      // If encoded, add that too
      if (contentEncoding) response.headers['Content-Encoding'] = contentEncoding
    }

    if (!response.statusCode) {
      response.statusCode = 200
    }

    return response
  }
  catch (err) {
    let notFound = err.name === 'NoSuchKey'
    if (notFound) {
      return await pretty({ Bucket, Key, assets, headers, isFolder, prefix })
    }
    else {
      let title = err.name
      let message = `
        ${err.message}<br>
        <pre>${err.stack}</pre>
      `
      return httpError({ statusCode: 500, title, message })
    }
  }
}

/**
 * Fingerprinting manifest
 *   Load the manifest, try to hit the disk as infrequently as possible across invocations
 */
let staticAssets
let staticManifest = join(process.cwd(), 'node_modules', '@architect', 'shared', 'static.json')
if (staticAssets === false) {
  null /*noop*/
}
else if (existsSync(staticManifest) && !staticAssets) {
  staticAssets = JSON.parse(readFileSync(staticManifest))
}
else {
  staticAssets = false
}
