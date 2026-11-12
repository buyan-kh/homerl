"use client";

import type { LcCompare, LcTest } from "@/data/leetcode/types";

export type RunResult = { stdout: string; error: string | null };
export type TestResult = { input: string; expected: string; got: string; ok: boolean };
export type CheckResult = { fatal: string | null; stdout: string; results: TestResult[] };

type Pending = { resolve: (value: unknown) => void; reject: (err: Error) => void };

const LOAD_TIMEOUT_MS = 90_000;
export const RUN_TIMEOUT_MS = 6_000;
export const CHECK_TIMEOUT_MS = 10_000;

export class TimeoutError extends Error {}

let worker: Worker | null = null;
let loaded: Promise<void> | null = null;
let nextId = 1;
const pending = new Map<number, Pending>();

function spawn(): Worker {
  const w = new Worker("/pyodide-worker.js");
  w.onmessage = (event: MessageEvent) => {
    const { id, ok, result, error } = event.data as { id: number; ok: boolean; result?: unknown; error?: string };
    const p = pending.get(id);
    if (!p) return;
    pending.delete(id);
    if (ok) p.resolve(result);
    else p.reject(new Error(error ?? "Python worker error"));
  };
  w.onerror = (event) => {
    const err = new Error(event.message || "Could not start the Python worker");
    for (const p of pending.values()) p.reject(err);
    pending.clear();
    kill();
  };
  return w;
}

function kill() {
  worker?.terminate();
  worker = null;
  loaded = null;
}

function send<T>(message: Record<string, unknown>, timeoutMs: number): Promise<T> {
  if (!worker) worker = spawn();
  const id = nextId++;
  const w = worker;
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (!pending.has(id)) return;
      pending.delete(id);
      // A stuck run cannot be interrupted, so throw the whole worker away. The next run starts a fresh one.
      if (worker === w) kill();
      reject(new TimeoutError(`Stopped after ${Math.round(timeoutMs / 1000)} seconds. Look for an infinite loop or very slow code.`));
    }, timeoutMs);
    pending.set(id, {
      resolve: (value) => {
        clearTimeout(timer);
        resolve(value as T);
      },
      reject: (err) => {
        clearTimeout(timer);
        reject(err);
      },
    });
    w.postMessage({ id, ...message });
  });
}

export function isPythonLoaded() {
  return loaded !== null;
}

/** Loads Pyodide on first use. Later calls reuse the same worker. */
export function ensurePython(): Promise<void> {
  if (!loaded) {
    loaded = send<void>({ type: "load" }, LOAD_TIMEOUT_MS).catch((err) => {
      kill();
      throw err;
    });
  }
  return loaded;
}

export async function runPython(code: string): Promise<RunResult> {
  await ensurePython();
  return send<RunResult>({ type: "run", code }, RUN_TIMEOUT_MS);
}

export async function checkPython(
  code: string,
  unit: { func: string; tests: LcTest[]; compare: LcCompare; mode: "func" | "class" },
): Promise<CheckResult> {
  await ensurePython();
  return send<CheckResult>(
    {
      type: "check",
      code,
      func: unit.func,
      tests: JSON.stringify(unit.tests),
      compare: unit.compare,
      mode: unit.mode,
    },
    CHECK_TIMEOUT_MS,
  );
}
