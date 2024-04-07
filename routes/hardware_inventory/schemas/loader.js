'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
    fastify.addSchema(require('./hardware.json'))
    fastify.addSchema(require('./list-query.json'))
    fastify.addSchema(require('./list-response.json'))
    fastify.addSchema(require('./create-body.json'))
    fastify.addSchema(require('./update-body.json'))
    fastify.addSchema(require('./create-response.json'))
    fastify.addSchema(require('./status-params.json'))
    fastify.addSchema(require('./read-params.json'))
})