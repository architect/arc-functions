// Bundler index + defaults
const GetIndexDefaultHandler = require('./index.js')
exports.handler = GetIndexDefaultHandler.proxy({ spa: false })
