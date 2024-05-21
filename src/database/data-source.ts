import { DataSource } from "typeorm";
import { env } from "../app/utils/Env";
import { Cliente } from "../app/entity/Clientes";
import { Fatura } from "../app/entity/Fatura";
import { DetalheConsumo } from "../app/entity/DetalheConsumo";


const config: any = env.isDevelopment
	? {
			type: "postgres",
			host: env.TYPEORM_HOST,
			port: parseInt(env.TYPEORM_PORT),
			username: env.TYPEORM_USERNAME,
			password: env.TYPEORM_PASSWORD,
			database: env.TYPEORM_DATABASE,
			// entities: [`${__dirname}/../app/entity/*.{ts,js}`],
			entities: [
				Cliente,
				Fatura,
				DetalheConsumo
			],
			synchronize: false // Lembre-se de que isso não deve ser usado em produção
		}
	: {
			type: "postgres",
			host: env.TYPEORM_HOST,
			port: parseInt(env.TYPEORM_PORT),
			username: env.TYPEORM_USERNAME,
			password: env.TYPEORM_PASSWORD,
			database: env.TYPEORM_DATABASE,
			// entities: [`${__dirname}/../app/entity/*.{ts,js}`],
			
			synchronize: false // Lembre-se de que isso não deve ser usado em produção
		};
export const AppDataSource = new DataSource(config);
