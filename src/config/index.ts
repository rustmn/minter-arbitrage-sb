import development from "./development";
import production from "./production";

const node_env: string = process.env.NODE_ENV as string;

const config = node_env === 'development' ? development : production;

export default config;