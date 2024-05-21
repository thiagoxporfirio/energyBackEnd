import {type Request, type Response} from "express";


export async function health(request: Request, response: Response) {
    try {
        // Rota de teste
        const teste = "teste ok";

        const result = {
            status: "ok",
            teste: teste
        }
        return response.status(201).json(result);
    } catch (error) {
        return response.status(500).send("Internal Server Error");
    }
}
