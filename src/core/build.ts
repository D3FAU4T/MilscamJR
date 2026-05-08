const result = await Bun.build({
    entrypoints: ["index.ts"],
    outdir: 'dist',
    compile: {
        outfile: "MilscamsJR",
        windows: {
            title: "MilscamsJR",
            description: "A Twitch bot for Milscams channel",
            version: "0.1.0",
            publisher: "D3FAU4T",
            icon: "icon.ico",
            copyright: "None"
        }
    }
});

result.success ? console.log("Build succeeded!") : console.error("Build failed:", result.logs);