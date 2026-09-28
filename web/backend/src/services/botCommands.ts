import { config } from "@/config";
export async function fetchCommandNames(): Promise<string[]> {
    const res = await fetch(`http://bot:${config.INTERNAL_PORT}/internal/commands`, {
        headers: { Authorization: `Bearer ${config.INTERNAL_API_SECRET}` },
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch command names: ${res.status}`);
    }
    const { commands } = await res.json() as { commands: string[] };
    return commands;
}