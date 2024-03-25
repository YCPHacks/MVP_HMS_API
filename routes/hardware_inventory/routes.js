'use strict'
module.exports = async function hardwareRoutes(fastify, options) {

    const hardware = await fastify.mysql.getConnection()

    async function listHardware(request, reply) {
        /*
        - get the query parameters for the HTTP request
        - pageSize and pageNumber help calculate the skip and limit values
        for pagination
        - name allows us to filter for specific hardware items
        */
        const {pageSize, pageNumber, name} = request.query
        //calculation for  the skip value
        const skip = (pageNumber - 1) * pageSize
        //limit value for the number of items to be retrieved on each page
        const limit = pageSize
        //name of stored procedure to be called
        const statement = "CALL list_hardware_items(?,?,?);"
       
        //try-catch block to handle the database operation
        try {
            //execute the stored procedure
            const [rows] = await hardware.query(statement, [skip, limit, name])
            //get the data from the rows
            const data = rows[0]
            //get the length of the data
            const length = data.length
            if (length > 0) {
                //send the data and the total number of items if items are found
                reply.code(200).send({hardware_data: data, itemCount: length})
            } else {
                //send an error message if no items are found
                reply.code(404).send({error: 'No hardware items found'})
            }
        } catch (error) {
            //send an error message if an error occurs (Internal Server Error)
            reply.code(500).send({error: 'Error retrieving hardware items'})
        } finally {
            //release the connection
            hardware.release()
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
        /*
        - name: name of the hardware item
        - label: label of the hardware item format (XX-Number)
        - category: category of the hardware item
        - description: description of the hardware item
        */
        const {name, label, category, description} = request.body

        //name of stored procedure to be called
        const statement = 'CALL create_hardware_item(?,?,?,?);';
        
        try {
            //execute the stored procedure
            await hardware.execute(statement, [name, label, category, description])
            //send a success message if the item is created successfully
            reply.code(201).send({message: 'Hardware item: ' + name + ' created successfully'})
        } catch (error) {
            //send an error message if an error occurs (Internal Server Error)
            reply.code(500).send({error: 'Error creating hardware item: ' + name})
        } finally {
            //release the connection
            hardware.release()
        }
    }

    fastify.route({
        method: 'POST',
        url: '/',
        handler: createHardware
    })

    async function readHardware(request, reply) {
        //get the id for the HTTP request from the URL
        const id = request.params.id

        //name of stored procedure to be called
        const statement = 'CALL read_hardware_item(?);'

        try {
            //execute the stored procedure
            const [rows] = await hardware.query(statement, [id])
            //get the data from the rows
            const data = rows[0]

            if (length > 0) {
                //send the data if an item is found
                reply.code(200).send(data)
            } else {
                //send an error message if no item is found
                reply.code(404).send({error: 'No hardware item found'})
            }
        } catch (error) {
            //send an error message if an error occurs (Internal Server Error)
            reply.code(500).send({error: 'Error retrieving hardware item'})
        } finally {
            //release the connection
            hardware.release()
        }
    }

    fastify.route({
        method: 'GET',
        url: '/:id',
        handler: readHardware
    })

    async function updateHardware (request, reply) {
        //get the id for the HTTP request from the URL
        const id = request.params.id

        //get the data for the HTTP request
        const { name, label, category, description } = request.body

        //name of stored procedure to be called
        const statement = 'CALL update_todo_item(?,?,?,?,?);'
    
        try {
          //execute the stored procedure
          await hardware.execute(statement, [id, name, label, category, description])
          //send a success message if the item is updated successfully
          reply.code(204).send({message: 'Hardware item updated successfully'})
        } catch (error) {
          //send an error message if an error occurs (Internal Server Error)
          reply.code(500).send({error: error.message})
        } finally {
          //release the connection
          hardware.release()
        }
    }

    fastify.route({
        method: 'PUT',
        url: '/:id',
        handler: updateHardware
    })

    async function deleteHardware(request, reply) {
        //get the id for the HTTP request from the URL
        const id = request.params.id

        //name of stored procedure to be called
        const statement = 'CALL delete_hardware_item(?);'

        try {
            //execute the stored procedure
            await hardware.execute(statement, [id])
            reply.code(204).send()
        } catch (error) {
            //send an error message if an error occurs (Internal Server Error)
            reply.code(500).send({error: 'Error deleting hardware item'})
        } finally {
            //release the connection
            hardware.release()
        }
    }

    fastify.route({
        method: 'DELETE',
        url: '/:id',
        handler: deleteHardware
    })

    async function changeStatus (request, reply) {
        //get the id and status for the HTTP request from the URL
        const id = request.params.id
        const status = request.params.status

        //name of stored procedure to be called
        const statement = 'CALL change_hardware_item_status(?,?);'
    
        try {
          //execute the stored procedure
          await hardware.execute(statement, [id, status])
          reply.code(204).send()
        } catch (error) {
          //send an error message if an error occurs (Internal Server Error)
          reply.code(500).send({message: "Error changing hardware item status"})
        } finally {
          //release the connection
          todos.release()
        }
      
      }
    
      fastify.route({
        method: 'POST',
        url: '/:id/:status',
        handler: changeStatus
      })
}