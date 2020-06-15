let { existsSync, readFileSync } = require('fs')
let { extname, join, sep } = require('path')
let mime = require('mime-types')
let crypto = require('crypto')

let binaryTypes = require('../../helpers/binary-types')
let { httpError } = require('../../errors')
let transform = require('../format/transform') // Soon to be deprecated
let templatizeResponse = require('../format/templatize')
let normalizeResponse = require('../format/response')
let pretty = require('./_pretty')

/**
 * arc.http.proxy.read
 *
 * Reads a file from the local filesystem, resolving an HTTP Lambda friendly payload
 *
 * @param {Object} params
 * @param {String} params.Key
 * @param {String} params.IfNoneMatch
 * @param {String} params.isFolder
 * @param {String} params.isProxy
 * @param {Object} params.config
 * @returns {Object} {statusCode, headers, body}
 */
module.exports = async function readLocal (params) {

  let { ARC_SANDBOX_PATH_TO_STATIC, ARC_STATIC_PREFIX, ARC_STATIC_FOLDER } = process.env
  let { Key, IfNoneMatch, isFolder, isProxy, config, request } = params
  let headers = {}
  let response = {}

  // Unlike S3, handle basePath and assets inside the function as Sandbox is long-lived
  let staticAssets
  // After 6.x we can rely on this env var in sandbox
  let basePath = ARC_SANDBOX_PATH_TO_STATIC || join(process.cwd(), '..', '..', '..', 'public')
  let staticManifest = join(basePath, 'static.json')
  if (existsSync(staticManifest)) {
    staticAssets = JSON.parse(readFileSync(staticManifest))
  }
  let assets = config.assets || staticAssets

  // Look up the blob
  // Assume we're running from a lambda in src/**/* OR from vendored node_modules/@architect/sandbox
  let filePath = join(basePath, Key)
  // Denormalize static folder for local paths (not something we'd do in S3)
  let staticPrefix = ARC_STATIC_PREFIX || ARC_STATIC_FOLDER
  if (filePath.includes(staticPrefix)) {
    filePath = filePath.replace(`${staticPrefix}${sep}`, '')
  }

  try {
    // If client sends If-None-Match, use it in S3 getObject params
    let matchedETag = false

    // If the static asset manifest has the key, use that, otherwise fall back to the original Key
    let contentType = mime.contentType(extname(Key))

    if (!existsSync(filePath)) {
      let err = ReferenceError(`NoSuchKey: ${filePath} not found`)
      err.name = 'NoSuchKey'
      throw err
    }

    let body = readFileSync(filePath)
    let ETag = crypto.createHash('sha256').update(body).digest('hex')
    let result = {
      ContentType: contentType,
      ETag
    }
    if (IfNoneMatch === ETag) {
      matchedETag = true
      headers.ETag = IfNoneMatch
      response = {
        statusCode: 304,
        headers
      }
    }

    // No ETag found, return the blob
    if (!matchedETag) {
      let isBinary = binaryTypes.some(type => result.ContentType.includes(type) || contentType.includes(type))

      // Transform first to allow for any proxy plugin mutations
      response = transform({
        Key,
        config,
        isBinary,
        defaults: {
          headers,
          body
        }
      })

      // Handle templating
      response = templatizeResponse({
        isBinary,
        assets,
        request,
        response,
        isLocal: true
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
    }

    if (!response.statusCode) {
      response.statusCode = 200
    }

    return response
  }
  catch (err) {
    let notFound = err.name === 'NoSuchKey'
    if (notFound) {
      return await pretty({ Key: filePath, config, isFolder })
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
