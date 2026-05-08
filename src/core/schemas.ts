import { z } from "zod";

const configDefaults = {
    authentication: {
        clientId: "zgca1nhycsw4l0srx4gavhbj6o7zjk",
        accessToken: null,
        clientSecret: null,
        broadcasterUserId: "124571546",
        userId: "1492484655",
    },
    
    socials: {
        youtube: "https://www.youtube.com/@milscams",
        tiktok: "https://www.tiktok.com/@onlymilscams",
        x: "https://x.com/fatmanjamil"
    }
};

export const configSchema = z.object({
    authentication: z.object({
        clientId: z.string().default(configDefaults.authentication.clientId),
        accessToken: z.string().nullable().describe("Twitch API Access Token from a Grant Flow").default(configDefaults.authentication.accessToken),
        clientSecret: z.string().nullable().describe("Twitch API Client Secret from Dashboard").default(configDefaults.authentication.clientSecret),
        broadcasterUserId: z.string().default(configDefaults.authentication.broadcasterUserId),
        userId: z.string().default(configDefaults.authentication.userId),
    }).default(configDefaults.authentication),

    socials: z.object({
        youtube: z.string().default(configDefaults.socials.youtube),
        tiktok: z.string().default(configDefaults.socials.tiktok),
        x: z.string().default(configDefaults.socials.x)
    }).default(configDefaults.socials)
});