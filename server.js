// import { createServer } from 'node:http'

// const server = createServer((request, response) =>{
//     response.write("oi")

//     return response.end()
// })

// server.listen(3333)

import {fastify} from "fastify";
import { DatabaseMemoryPostgres } from "./database-postgres.js";

const database = new DatabaseMemoryPostgres()

const server = fastify()

server.post('/usuarios', async (request, reply) => {
    const {firstName, lastName, email, password} = request.body
    
    console.log(request.body)

    await database.createUser({
        firstName, 
        lastName, 
        email, 
        password
    })

    return reply.status(201).send()
})

server.get('/usuarios', async (request, reply) => {
    const search = request.query.search
    
    const usuarios = await database.listUser(search)

    return usuarios
})

server.post('/usuarios/login', async (request, reply) =>{
    const {email, password} = request.body

    
    const usuario = await database.getUser({email, password})

    return usuario
})

server.put('/videos/:id', async (request, reply) => {
    const videoId = request.params.id
    const {title, description, duration} = request.body


    await database.update(videoId, {
        title, 
        description, 
        duration
    })


    return reply.status(204).send()
})

server.delete('/videos/:id', async (request, reply) => {
    const videoId = request.params.id
    
    await database.delete(videoId)

    return reply.status(204).send()
})

server.listen({
    port: 3333,
})