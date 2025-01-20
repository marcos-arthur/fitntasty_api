import { randomUUID } from "crypto"
import { sql } from "./db.js"

export class DatabaseMemoryPostgres{
    async getUser(userData) {
        const { email, password } = userData;
        console.log(userData);
    
        const user = await sql`
            SELECT "id_usuario", "email", "firstName", "lastName", "id_tipousuario"
            FROM "usuario"
            WHERE "email" = ${email} AND "password" = ${password}
        `.catch(error => {
            console.error(error);
        });
    
        return user?.[0] || null; // Retorna apenas o primeiro usuário ou null
    }
    

    async listUser(search){
        let users

        if(search){
            users = await sql`SELECT * FROM USUARIO WHERE "firstName" ILIKE "%${search}%"`
        } else{
            users = await sql`SELECT * FROM USUARIO`
        }

        return users
    }

    async createUser(user) {
        const { firstName, lastName, email, password, isNutritionist, crn, photoUrl, phone } = user;
    
        // Verificar se o email já está em uso
        const existingUser = await sql`
            SELECT 1 FROM usuario WHERE "email" = ${email}
        `;
    
        if (existingUser.length > 0) {
            throw new Error('Email já está em uso.');
        }
    
        // Inserir os campos dependendo de "isNutritionist"
        await sql`
            INSERT INTO usuario (
                "firstName", "lastName", "email", "password", "isNutritionist", "crn", "photoUrl", "phone"
            )
            VALUES (
                ${firstName}, ${lastName}, ${email}, ${password},
                ${isNutritionist || false}, 
                ${isNutritionist ? crn : null},
                ${isNutritionist ? photoUrl : null},
                ${isNutritionist ? phone : null}
            )
        `;
    }    

    async listIngredients(){
        return await sql`SELECT * FROM INGREDIENTS`
    }

    async getIngredientByName(ingredientName){
        return await sql`SELECT * FROM INGREDIENTS WHERE "name" = ${ingredientName}`
    }

    async addIngredient(ingredientName){
        return await sql`INSERT INTO INGREDIENTS ("name") VALUES (${ingredientName}) RETURNING id_ingredient`
    }

    async listRecipes(){
        return await sql`
            SELECT "id_recipe", "title", "image", "calories", "prepTime" FROM RECIPES
        `
    }

    async getRecipeById(id_recipe){
        return await sql`
            SELECT "id_recipe", "title", "image", "calories", "prepTime" FROM RECIPES
            WHERE "id_recipe" = ${id_recipe}
        `
    }

    async addRecipe(recipe) {
        const { title, image, description, ingredients, steps, calories, prepTime } = recipe;
        const recipeId = Array.from(await sql`
            INSERT INTO recipes ("title", "image", "description", "steps", "calories", "prepTime", "id_usuario") 
            VALUES (${title}, ${image}, ${description}, ${steps}, ${calories}, ${prepTime}, 2) 
            RETURNING id_recipe`)[0].id_recipe;
        
        ingredients.map(async (ingredient) => {
            const { name, unidade_de_medida, qtd } = ingredient;
            let ingredientId = Array.from(await this.getIngredientByName(name))[0];
            
            if (!ingredientId) {
                ingredientId = Array.from(await this.addIngredient(name))[0].id_ingredient;
            }
            
            await sql`INSERT INTO recipe_ingredients ("id_recipe", "id_ingredient", "quantity", "measure_unity") VALUES (${recipeId}, ${ingredientId}, ${qtd}, ${unidade_de_medida})`;
        });
    }
    
    

    async getIngredientByRecipeId(id_recipe){
        return await sql`
            SELECT ri.*, i.*
            FROM RECIPE_INGREDIENTS ri
            INNER JOIN INGREDIENTS i ON i.id_ingredient = ri.id_ingredient
            WHERE ri.id_recipe = ${id_recipe}
        `
    }

    async listNutritionists() {
        return await sql`
            SELECT "firstName", "lastName", "crn", "photoUrl", "email", "phone"
            FROM "usuario"
            WHERE "isNutritionist" = true
        `;
    }
     

    // update(id, video){
    // }
    
    
    update(id, video){
    }

    // delete(id){
    // }
}