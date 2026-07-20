import { setTimeout as delay } from "timers/promises";

const SCAN_TIMEOUT_MS = 5000;
const SUSPICIOUS_PATTERNS = [
  "<script",
  "javascript:",
  "eval(",
  "cmd.exe",
  "powershell",
  "rm -rf",
  "drop table",
  "mimikatz",
  "malware",
  "virus",
  "trojan",
  "worm",
];

export type ScanResult = {
  safe: boolean;
  reason?: string;
};

async function inspectBuffer(buffer: Buffer): Promise<ScanResult> {
  if (buffer.length === 0) {
    return { safe: false, reason: "empty-file" };
  }

  const sampleLength = Math.min(buffer.length, 8192);
  const sample = buffer.slice(0, sampleLength).toString("utf8").toLowerCase();

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (sample.includes(pattern)) {
      return { safe: false, reason: "pattern-match" };
    }
  }

  return { safe: true };
}

export async function scanFile(buffer: Buffer): Promise<ScanResult> {
  const scanTask = (async (): Promise<ScanResult> => {
    try {
      await delay(250);
      return inspectBuffer(buffer);
    } catch {
      return { safe: false, reason: "internal-error" };
    }
  })();

  const timeoutTask = delay(SCAN_TIMEOUT_MS, { safe: false, reason: "timeout" });

  const result = await Promise.race([scanTask, timeoutTask]);

  return result;
}
