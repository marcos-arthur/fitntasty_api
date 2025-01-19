import { fastify } from "fastify";
import fastifyCors from '@fastify/cors';
import { DatabaseMemoryPostgres } from "./database-postgres.js";

const database = new DatabaseMemoryPostgres();
const server = fastify();

server.register(fastifyCors, {
    origin: "*",
});

server.post('/usuarios', async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "POST");

    const { firstName, lastName, email, password, isNutritionist, crn, photoUrl, phone } = request.body;

    try {
        // Chama a função do banco para criar o usuário
        await database.createUser({
            firstName,
            lastName,
            email,
            password,
            isNutritionist,
            crn,
            photoUrl,
            phone
        });

        return reply.status(201).send({ message: 'Usuário criado com sucesso!' });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);

        if (error.message === 'Email já está em uso.') {
            return reply.status(400).send({ error: error.message });
        }

        // Retorna um erro genérico para outros casos
        return reply.status(500).send({ error: 'Erro interno no servidor.' });
    }
});


server.listen({
    port: 3333,
}, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server is running on ${address}`);
});

server.get('/usuarios', async (request, reply) => {
    const search = request.query.search
    
    const usuarios = await database.listUser(search)

    return usuarios
})

server.post('/usuarios/login', async (request, reply) => {
    console.log('Login request received:', request.body);
  
    const { email, password } = request.body;
    const usuario = await database.getUser({ email, password });
  
    if (usuario) {
      return reply.status(200).send(usuario);
    }
  
    return reply.status(401).send({ error: 'Email ou senha inválidos' });
  });
  
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
