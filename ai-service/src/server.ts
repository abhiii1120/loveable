import app from "./app/app.js";
import { connectDatabase } from "./config/database.js";
import { connectToMessageBroker } from "./service/broker.service.js";

await connectToMessageBroker();
await connectDatabase();

app.listen(3001,() => {
    console.log('AI service is running on port 3001')
})