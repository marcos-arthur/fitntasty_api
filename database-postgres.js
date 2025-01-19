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

    async createUser(user){
        const {firstName, lastName, email, password} = user
        await sql`INSERT INTO usuario ("firstName", "lastName", "email", "password") VALUES (${firstName}, ${lastName}, ${email}, ${password})`
    }

    update(id, video){
    }

    delete(id){
    }
}