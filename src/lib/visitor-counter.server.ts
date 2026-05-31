import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type VisitorCounterStore = {
  total: number;
  visitors: Record<string, string>;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const COUNTER_FILE = path.join(DATA_DIR, "visitor-counter.json");

async function readStore(): Promise<VisitorCounterStore> {
  try {
    const raw = await readFile(COUNTER_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<VisitorCounterStore>;

    return {
      total: typeof parsed.total === "number" ? parsed.total : 0,
      visitors: parsed.visitors && typeof parsed.visitors === "object" ? parsed.visitors : {},
    };
  } catch {
    return {
      total: 0,
      visitors: {},
    };
  }
}

async function writeStore(store: VisitorCounterStore) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(COUNTER_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function registerVisitor(visitorId: string) {
  const normalizedVisitorId = visitorId.trim();
  const store = await readStore();

  if (!normalizedVisitorId) {
    return { total: store.total };
  }

  if (!store.visitors[normalizedVisitorId]) {
    store.visitors[normalizedVisitorId] = new Date().toISOString();
    store.total += 1;
    await writeStore(store);
    return { total: store.total };
  }

  store.visitors[normalizedVisitorId] = new Date().toISOString();
  await writeStore(store);
  return { total: store.total };
}
