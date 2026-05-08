import path from "node:path";
import { z } from "zod";
import { log, password, isCancel, outro, spinner } from "@clack/prompts";
import { Auth } from "twitch";
import { mkdir, exists } from "node:fs/promises";
import { getDocumentsPath } from "./document"
import { configSchema } from "./schemas";

export const spin = spinner({
    indicator: 'dots',
    cancelMessage: "Process cancelled",
    errorMessage: "Process failed",
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    delay: 80,
    styleFrame: (frame) => `\x1b[35m${frame}\x1b[0m`,
});

export const ensureConfig = async (): Promise<z.infer<typeof configSchema>> => {
    const libPath = path.join(getDocumentsPath(), "MilscamJR");

    if (!(await exists(libPath))) {
        log.warn(`Config directory does not exist, creating ${libPath}...`);
        await mkdir(libPath, { recursive: true });
    }

    const configPath = path.join(libPath, "Config.json");

    const file = Bun.file(configPath);

    let config = configSchema.parse({});

    if (!(await file.exists())) {
        const clientSecret = await password({
            message: "Enter your Client Secret",
            mask: '*',
        });

        if (isCancel(clientSecret) || clientSecret.trim() === "") {
            log.warn(`No Client Secret provided. The config file will be created with an empty access token, and you will need to fill it in manually here: ${configPath}`);
            await file.write(JSON.stringify(config, null, 2));
            outro("Setup partially configured");
            process.exit(1);
        }

        config.authentication.clientSecret = clientSecret;

        spin.start("Obtaining access token...");

        const authentication = await Auth.clientCredentialGrantFlow(config.authentication.clientId, clientSecret);

        if ('error' in authentication) {
            log.error(`Failed to obtain access token: ${authentication.message}`);
            await file.write(JSON.stringify(config, null, 2));
            outro("Setup partially configured");
            process.exit(1);
        }

        spin.stop("Access token obtained!");

        config.authentication.accessToken = authentication.access_token;
        await file.write(JSON.stringify(config, null, 2));
    }

    else config = configSchema.parse(await file.json());

    return config;
}