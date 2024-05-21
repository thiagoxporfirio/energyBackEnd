export class Env {
    isProduction: boolean;
    isDevelopment: boolean;
    isStaging: boolean;
    env: string;
    TYPEORM_CONNECTION: string;
    TYPEORM_HOST: string;
    TYPEORM_USERNAME: string;
    TYPEORM_PASSWORD: string;
    TYPEORM_DATABASE: string;
    TYPEORM_PORT: string;
    TYPEORM_ENTITIES: string;
    TYPEORM_ENTITIES_DIR: string;
    TYPEORM_JWT_SECRET: string;
    APP_PORT: string;

    APP_UTIL_API_URL: string;
    APP_URL: string;
    APP_API_SUFFIX: string;
    APP_CDN_SUFFIX: string;
    APP_FACEBOOK_REDIRECT_URI: string;
    APP_GOOGLE_REDIRECT_URI: string;
    GOOGLE_APPLICATION_CREDENTIALS: string;
    GOOGLE_AI_CREDENTIALS: string;
    AI_AGENT: string;
    CONFIG_ORIGIN: string;

};

export const env: Env = resolveEnv();

function resolveEnv(): Env {
    //read args
    // console.log('resolveEnf',__dirname)

    const args = process.argv.slice(2);
    //convert args to object
    const argsObject: any = args.reduce((acc, arg) => {
        const [key, value] = arg.split("=");
        return {...acc, [key]: value};
    }, {});

    const result = new Env();
    if (argsObject?.env === "prod" || argsObject?.env === "production") {
        // process.env.NODE_ENV = "production";
        require("dotenv").config({path: "./.env.production"});
        result.isProduction = true;
        result.isStaging = false;
        result.isDevelopment = false;
        result.env = "production";

    } else if (argsObject?.env === "staging" || argsObject?.env === "staging") {
        // process.env.NODE_ENV = "production";
        require("dotenv").config({path: "./.env.staging"});
        result.isProduction = false;
        result.isStaging = true;
        result.isDevelopment = false;
        result.env = "staging";
    } else {
        // process.env.NODE_ENV = "development";
        require("dotenv").config({path: "./.env.development"});
        result.isProduction = false;
        result.isStaging = false;
        result.isDevelopment = true;
        result.env = "development";
    }

    for (let envKey in process.env) {
        result[envKey] = process.env[envKey];
    }
    console.log("env", result.env)
    return result;
}
