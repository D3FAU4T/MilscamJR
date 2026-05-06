import { Client } from "twitch";
import { ensureConfig } from "./src/core/functions";

const config = await ensureConfig();

if (config.authentication.accessToken === "") {
    throw new Error("Access token is empty. Please fill in the access token in the config file and restart the application.");
}

const client = new Client({
    clientId: config.authentication.clientId,
    accessToken: config.authentication.accessToken,
    broadcasterUserId: config.authentication.broadcasterUserId,
    userId: config.authentication.userId,
});

client.on("channel.chat.message", async (notification) => {
    const message = notification.event.message.text;
    const user = notification.event.chatter_user_name;
    console.log(`[${user}]: ${message}`);

    const command = message.trim().toLowerCase();

    if (command === "!quit") {
        await client.say("Shutting down...");
        process.exit(0);
    }

    else if (command === "!test") {
        await client.say("This is a test message! VoHiYo")
    }
})

await client.connect();