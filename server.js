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

server.get('/nutricionists', async (request, reply) => {
    const nutricionists = await database.listNutricionists()

    return nutricionists
})

server.post('/usuarios/login', async (request, reply) =>{
    const {email, password} = request.body

    
    const usuario = await database.getUser({email, password})

    if (usuario) {
        return reply.status(200).send(usuario);
    }

    return reply.status(401).send({ error: 'Email ou senha inválidos' });
})

server.post('/recipes/search', async (request, reply) => {
    let recipes = []
    
    const ingredients = request.body?.ingredients
    if(ingredients){
        for(const ingredient of ingredients){
            const result = Array.from(await database.getRecipeByIngredient(ingredient))
            recipes.push(...result)
        }

        recipes = recipes.filter((value, index, self) =>
            index === self.findIndex((t) => (
              t.id_recipe === value.id_recipe
            ))
          )
    }else{
        recipes = await database.listRecipes()
    }
    // console.log(recipes)

    return reply.status(200).send(recipes);
})

server.post('/recipes/:id_recipe', async (request, reply) => {
    const recipe = Array.from(await database.getRecipeById(request.params.id_recipe))[0]
    
    if(recipe){
        const ingredients = Array.from(await database.getIngredientByRecipeId(recipe.id_recipe))
        recipe.ingredients = ingredients
    }

    return recipe
})

server.post('/recipes', async(request, reply) => {
    const {title, image, description, ingredients, steps, calories, prepTime} = request.body
    // console.log(request.body)

    await database.addRecipe({
        title, 
        image, 
        description, 
        ingredients, 
        steps, 
        calories, 
        prepTime
    })


    return reply.status(204).send()
})

server.delete('/videos/:id', async (request, reply) => {
    const videoId = request.params.id
    
    await database.delete(videoId)

    return reply.status(204).send()
})
