import path from "node:path";
import { Auth } from "twitch";
import { mkdir, exists } from "node:fs/promises";
import { getDocumentsPath } from "./document"
import { createInterface } from "node:readline/promises";

import type { Config } from "../types/Config";

const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
});

export const ensureConfig = async (): Promise<Config> => {
    const libPath = path.join(getDocumentsPath(), "MilscamJR");

    if (!(await exists(libPath))) {
        console.warn(`Config directory does not exist, creating ${libPath}...`);
        await mkdir(libPath, { recursive: true });
    }

    const configPath = path.join(libPath, "Config.json");

    const file = Bun.file(configPath);

    let config: Config = {
        authentication: {
            clientId: "zgca1nhycsw4l0srx4gavhbj6o7zjk",
            accessToken: "",
            broadcasterUserId: "124571546",
            userId: "1492484655",
        }
    };

    if (!(await file.exists())) {

        const clientSecret = await prompt.question("Enter your Client Secret: ");

        if (!clientSecret) {
            console.warn(`No Client Secret provided. The config file will be created with an empty access token, and you will need to fill it in manually here: ${configPath}`);
            await file.write(JSON.stringify(config));
            process.exit(1);
        }

        const authentication = await Auth.clientCredentialGrantFlow(config.authentication.clientId, clientSecret);

        if ('error' in authentication) {
            console.error("Failed to obtain access token:", authentication);
            await file.write(JSON.stringify(config));
            process.exit(1);
        }

        config.authentication.accessToken = authentication.access_token;
        await file.write(JSON.stringify(config));
    }

    else config = await file.json();

    return config;
}