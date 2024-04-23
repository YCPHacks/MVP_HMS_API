'use strict'

const fp = require('fastify-plugin');
const mysqlx = require('@mysql/xdevapi');

async function mysqlxPlugin(fastify, options) {
    // Ensure the configuration plugin has loaded
    if (!fastify.secrets || !fastify.secrets.MYSQL_HARDWARE_DATABASE_URL) {
        throw new Error('Database configuration not available');
    }

    let client;
    try {
        // Create a new client using the connection URL from the loaded environment configurations
        client = await mysqlx.getClient({
            user: fastify.secrets.DB_USER, // Assuming these details are part of the secrets
            password: fastify.secrets.DB_PASSWORD,
            host: fastify.secrets.DB_HOST,
            port: fastify.secrets.DB_PORT,
            schema: fastify.secrets.DB_SCHEMA
        });
        fastify.decorate('mysqlx', client);
        // console.log(client)
        // const session = await client.getSession();
        // console.log(session.inspect())
    } catch (error) {
        fastify.log.error('Error connecting to MySQL X DevAPI:', error);
        throw error;
    }

    fastify.addHook('onClose', async (instance, done) => {
        if (client) {
            try {
                await client.close();
                done();
            } catch (error) {
                fastify.log.error('Failed closing MySQL X client:', error);
                done(error);
            }
        }
    });
}

module.exports = fp(mysqlxPlugin, {
    name: 'fastify-mysqlx',
    dependencies: ['application-config']  // Depends on your custom configuration plugin
});