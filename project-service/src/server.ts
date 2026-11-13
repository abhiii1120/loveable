import { createApp } from "./app/app.js";
import { configDotenv } from "dotenv";
configDotenv();
import { startIdleReaper } from "./service/activity.service.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

let app = createApp();

async function startServer(){
    await connectDatabase();
    app.listen(env.PORT,() => {
        console.log("Project server is running on port",env.PORT);
    })
}

startServer();
await startIdleReaper();