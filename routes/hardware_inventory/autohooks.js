'use strict'

const fp = require('fastify-plugin')
const schemas = require('./schemas/loader')

module.exports = fp(async function (fastify, opts) {
    fastify.register(schemas)
})