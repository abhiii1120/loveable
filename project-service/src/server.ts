import { createApp } from "./app/app.js";
import { configDotenv } from "dotenv";
configDotenv();
import { startIdleReaper } from "./service/activity.service.js";

let app = createApp();
await startIdleReaper();

async function startServer(){

    app.listen(3000,() => {
        console.log("Project server is running on port 3000");
    })
}

startServer();