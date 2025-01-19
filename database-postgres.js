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
    
    
    update(id, video){
    }

    delete(id){
    }
}