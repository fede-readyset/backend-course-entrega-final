import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})

const configObject = {
    mongo_url: process.env.MONGO_URL,
    github_client_id: process.env.GITHUB_CLIENT_ID,
    github_client_secret: process.env.GITHUB_CLIENT_SECRET,
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    base_url: process.env.BASE_URL,
    gmail_app_passwd: process.env.GMAIL_APPLICATION_PASS,
    app_logo_url: process.env.APP_LOGO_URL
}
export default configObject;