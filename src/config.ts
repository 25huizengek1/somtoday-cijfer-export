import { readFile } from "fs/promises";
import { parse } from "path";
import { z } from "zod";

export const configValidator = z.object({
    schoolName: z.string().min(2).transform(s => s.toLowerCase()),
    username: z.string().min(2),
    password: z.string().min(2),
    delay: z.number().optional().default(10),
    screenshotDirectory: z.string().refine(path => {
        try {
            parse(path);
            return true;
        } catch(e) {
            console.error("Validation error:", e);
            return false;
        }
    }, {
        message: "The screenshotDirectory is not a valid path"
    }).optional().default("screenshots")
});

export type Config = z.infer<typeof configValidator>;

export async function getConfig(): Promise<Config | null> {
    const file = (await readFile("config.json")).toString("utf-8");
    try {
        const json = JSON.parse(file);
        return await configValidator.parseAsync(json);
    } catch (e) {
        console.error(e);
        return null;
    }
}
