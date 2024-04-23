'use strict'

const { test } = require('node:test')
const assert = require('node:assert')

const Fastify = require('fastify')
const Mysqlx = require('../../plugins/mysqlx')

test('mysqlx works standalone', async (t) => {
  const fastify = Fastify()

  fastify.register(Mysqlx, 'mysql://doadmin:AVNS_9igNM8WlFCagXUaUcEX@db-mysql-nyc3-90696-do-user-12845046-0.b.db.ondigitalocean.com:25064/ycphacks_hms?ssl-mode=REQUIRED')

  await fastify.ready()

  const session = await fastify.mysqlx.getSession();

  console.log(await session.inspect());

  await session.close();
})