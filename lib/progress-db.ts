import { promises as fs } from "fs";
import path from "path";
import type { DeckMemory } from "./types";

export type ProgressSnapshot = {
  memory: DeckMemory;
  liked: Record<string, true>;
  updatedAt: string;
};

type ProgressFile = Record<string, Record<string, ProgressSnapshot>>;

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE_PATH = path.join(DATA_DIR, "progress.json");

async function readFile(): Promise<ProgressFile> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return JSON.parse(raw) as ProgressFile;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw error;
  }
}

async function writeFile(data: ProgressFile) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE_PATH}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, FILE_PATH);
}

export async function readProgress(clientId: string, deckSlug: string): Promise<ProgressSnapshot | null> {
  const all = await readFile();
  return all[clientId]?.[deckSlug] ?? null;
}

export async function writeProgress(
  clientId: string,
  deckSlug: string,
  snapshot: Omit<ProgressSnapshot, "updatedAt">,
): Promise<ProgressSnapshot> {
  const all = await readFile();
  const next: ProgressSnapshot = {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };
  if (!all[clientId]) all[clientId] = {};
  all[clientId][deckSlug] = next;
  await writeFile(all);
  return next;
}
