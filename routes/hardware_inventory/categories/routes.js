'use strict'

module.exports = async function (fastify, opts) {

    const hardware = await fastify.mysql.getConnection()

    async function listCategories(request, reply) {
        //name of stored procedure to be called
        const statement = "CALL list_categories"
       
        //try-catch block to handle the database operation
        try {
            //execute the stored procedure
            const [rows] = await hardware.query(statement)

            //get the data from the rows
            const data = rows[0]
            const length = data.length
            if (length > 0) {
                //send the data and the total number of items if items are found
                reply.code(200).send(data)
            } else {
                //send an error message if no items are found
                reply.code(404).send({error: 'No categories'})
            }
        } catch (error) {
            //send an error message if an error occurs (Internal Server Error)
            reply.code(500).send({error: 'Error retrieving categories'})
        } finally {
            //release the connection
            hardware.release()
        }
    }

    fastify.route({
        method: 'GET',
        url: '/',
        handler: listCategories
    })
}