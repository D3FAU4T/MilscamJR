import colors from "picocolors";
import path from "node:path";
import { Auth, Client } from "twitch";
import { ensureConfig, spin } from "./src/core/functions";
import { getDocumentsPath } from "./src/core/document";
import { intro, log, password, isCancel, outro } from "@clack/prompts";

intro(colors.bgMagenta(" MilscamsJR "));

const config = await ensureConfig();

if (!config.authentication.clientSecret) {
    const clientSecret = await password({
        message: "Enter your Client Secret",
        mask: '*',
    });

    if (isCancel(clientSecret) || clientSecret.trim() === "") {
        outro("Setup cancelled");
        process.exit(1);
    }

    config.authentication.clientSecret = clientSecret;

    await Bun.write(path.join(getDocumentsPath(), "MilscamJR", "Config.json"), JSON.stringify(config, null, 2));
}

const isValidAuth = await Auth.validate(config.authentication.accessToken!);

if (!isValidAuth) {
    const auth = await Auth.clientCredentialGrantFlow(config.authentication.clientId, config.authentication.clientSecret);
    
    if ('error' in auth) {
        log.error(colors.red(`Authentication failed: ${auth.message}`));
        outro("Please check your Client ID and Client Secret and try again.");
        process.exit(1);
    }

    config.authentication.accessToken = auth.access_token;
    await Bun.write(path.join(getDocumentsPath(), "MilscamJR", "Config.json"), JSON.stringify(config, null, 2));
}

spin.start("Connecting to Twitch...");

const client = new Client({
    clientId: config.authentication.clientId,
    accessToken: config.authentication.accessToken!,
    broadcasterUserId: config.authentication.broadcasterUserId,
    userId: config.authentication.userId,
});

await client.subscribe({
    type: "channel.follow",
    version: "2",
    condition: {
        broadcaster_user_id: config.authentication.broadcasterUserId,
        moderator_user_id: config.authentication.broadcasterUserId
    }
});

client.on("channel.follow", async (notification) => {
    const follower = notification.event.user_name;
    await client.say(`Thank you for following, ${follower}! VoHiYo`);
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

    else if (command === "!socials") {
        await client.announce(`Follow Milscams on his socials: ${config.socials.youtube} | ${config.socials.tiktok} | ${config.socials.x}`);
    }
});

await client.connect();
spin.stop("Connected to Twitch");

outro("Listening for Twitch events");

await client.say("MilscamsJR is now connected! VoHiYo");

setInterval(async () => {
    await client.announce(`Follow Milscams on his socials: ${config.socials.youtube} | ${config.socials.tiktok} | ${config.socials.x}`);
}, 30 * 60 * 1000);