'use strict'

module.exports = async function hardwareRoutes(fastify, options) {

    async function listHardware(request, reply) {

        const {name, pageNumber, limit} = request.query; 
        const skip = (pageNumber - 1) * limit; 

        let session;
        try {
            session = await fastify.mysqlx.getSession();
            const listSQL = 'CALL list_hardware_items(?, ?, ?);';
            const result = await session.sql(listSQL).bind([name, skip, limit]).execute();
            const hardwareItems = await result.fetchOne();
        return hardwareItems[0];
        } catch (err) {
            console.error(err);
            reply.status(500).send({ error: 'Failed to retrieve hardware items', details: err.message });
        } finally {
            if (session) await session.close();
        }
    }

    fastify.route({
        method: 'GET',
        url: '/',
        //preValidation hook to authenticate the user before accessing the route
        preValidation: fastify.authenticate,
        handler: listHardware
    })
    
    async function createHardware(request, reply){
        const {name, category, description, link, quantity} = request.body;

        let session;

        try {
            session = await fastify.mysqlx.getSession()
            //await session.startTransaction();
            const createSQL = `CALL create_many_hardware_items(?, ?, ?, ?, ?);`;
            await session.sql(createSQL).bind([name, category, description, link, quantity]).execute();
            //await session.commit();
            reply.code(201).send({ message: 'New hardware item added successfully.' });
        } catch (error) {
            //await session.rollback();
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to add new hardware item and details', details: error.message });
        } finally {
            if(session) {
                await session.close();
            }
        }
    }

    fastify.route({
        method: 'POST',
        url: '/',
        handler: createHardware
    })

    async function readHardware(request, reply) {
        const name = request.params.name
        console.log(name);

        let session;
        try {
            session = await fastify.mysqlx.getSession();
            const readSQL = `CALL read_combined_hardware_details(?, @result);`
            await session.sql(readSQL).bind(name).execute();
            const blah = await session.sql('SELECT @result').execute();
            const hardwareItem = JSON.parse(await blah.fetchOne());
            return hardwareItem;
        } catch (error) {
            //await session.rollback();
            request.log.error(error);
            reply.code(500).send({ error: 'Failed to add new hardware item and details', details: error.message });
        } finally {
            if(session) {
                await session.close();
            }
        }
    }

    fastify.route({
        method: 'GET',
        url: '/:name',
        handler: readHardware
    })

    async function updateHardware (request, reply) {
        const sku = request.params.sku

        const { name, category, description, link } = request.body
    
        let session;
        try {
            session = await fastify.mysqlx.getSession();
            const updateSQL = `CALL update_hardware_item(?, ?, ?, ?, ?);`
            await session.sql(updateSQL).bind([sku, name, category, description, link]).execute();

            reply.code(200).send({ message: 'Hardware item updated successfully' });
        } catch (error) {
            reply.code(500).send({ error: 'Failed to update hardware item', details: error.message });
        } finally {
            if (session) {
                await session.close();
            }
        }
    }

    fastify.route({
        method: 'PUT',
        url: '/:sku',
        handler: updateHardware
    })

    async function deleteHardware(request, reply) {
        const sku = request.params.sku

        let session;
        try {
            session = await fastify.mysqlx.getSession();
            const deleteSQL = `CALL delete_hardware_item(?);`
            await session.sql(deleteSQL).bind(sku).execute();
            reply.code(204).send();
        } catch (error) {
            reply.status(500).send({ error: 'Failed to delete hardware item', details: error.message });
        } finally {
            if (session) {
                await session.close();
            }
        }
    }

    fastify.route({
        method: 'DELETE',
        url: '/:sku',
        handler: deleteHardware
    })
}