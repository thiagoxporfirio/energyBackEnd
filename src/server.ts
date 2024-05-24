import "reflect-metadata";
import { AppDataSource } from "./database/data-source";
import express from "express";
import cors from "cors";

import { router } from "./router";
import { env as environment } from "./app/utils/Env";


let basePath = environment.APP_API_SUFFIX;

// Initialize the data source and start the server

/**
 * Webpack HMR Activation
 */

type ModuleId = string | number;
console.log("origin",process.env.CONFIG_ORIGIN)
interface WebpackHotModule {
	hot?: {
		data: any;
		accept(
			dependencies: string[],
			callback?: (updatedDependencies: ModuleId[]) => void
		): void;
		accept(dependency: string, callback?: () => void): void;
		accept(errHandler?: (err: Error) => void): void;
		dispose(callback: (data: any) => void): void;
	};
}

declare const module: WebpackHotModule;

AppDataSource.initialize()
	.then(() => {
		console.log("Connected to PostgreSQL with DataSource successfully");
		const app = express();
		const PORT = process.env.APP_PORT;

		app.use(express.json());
		app.use(cors());		
		app.use(basePath, router);
		


		const server = app.listen(PORT, () => {
			console.clear()
			console.log(`Server is running on https://localhost:${PORT}`);
			console.log("Banco conectado");
		});

		if (module.hot) {
			module.hot.accept();
			module.hot.dispose(() => server.close());
		}
	})
	.catch(error => {
		console.error("Error during DataSource initialization", error);
	});
