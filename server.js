// import { createServer } from 'node:http'

// const server = createServer((request, response) =>{
//     response.write("oi")

//     return response.end()
// })

// server.listen(3333)

import {fastify} from "fastify";
import fastifyCors from '@fastify/cors';
import { DatabaseMemoryPostgres } from "./database-postgres.js";

const database = new DatabaseMemoryPostgres()
const server = fastify()

server.register(fastifyCors, {
    origin: "*", 
});

server.post('/usuarios', async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "POST");
    const {firstName, lastName, email, password} = request.body

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

    return reply.status(201).send()
})

server.get('/ingredients', async (request, reply) => {
    return await database.listIngredients()
})

server.post('/ingredients/:name', async (request, reply) => {
    return await database.getIngredientByName(request.params.name)
})

server.post('/ingredients/add/:name', async (request, reply) => {
    return await database.addIngredient(request.params.name)
})

server.listen({
  port: 3333,
}, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is running on ${address}`);
});
