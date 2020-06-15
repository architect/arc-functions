let tmpl = require('./lodash.template-4.5.0.js')

module.exports = function templatizeResponse (params) {

  let { isBinary, assets, request, response, isLocal=false } = params

  if (isBinary)
    return response

  // server scoped helper functions...
  let arc = {
    static(path) {
      let startsWithSlash = path.startsWith('/')
      let lookup = startsWithSlash ? path.substr(1) : path
      if (assets && assets[lookup] && !isLocal) {
        path = assets[lookup]
        path = startsWithSlash ? `/${path}` : path
      }
      return path
    },
    request
  }

  let body = response.body instanceof Buffer ? Buffer.from(response.body).toString() : response.body
  let replacer = tmpl(body) // TODO cache compiled function in a ledger keyed on ...somethin
  response.body = replacer({ arc, STATIC: arc.static }) // TODO Deprecate STATIC
  response.body = Buffer.from(response.body)
  return response
}
