import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})

const configObject = {
    mongo_url: process.env.MONGO_URL,
    github_client_id: process.env.GITHUB_CLIENT_ID,
    github_client_secret: process.env.GITHUB_CLIENT_SECRET,
    node_env: process.env.NODE_ENV,
    port: process.env.PORT
}

console.log(configObject.mongo_url)
export default configObject;