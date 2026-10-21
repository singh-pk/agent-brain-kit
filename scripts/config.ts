import { join } from "node:path";
import { readText } from "./markdown";

export type ProcessConfig = {
  designFiles: string[];
  areas: string[];
  specTestFile: string;
};

function strings(value: unknown, key: string): string[] {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value;
  }
  throw new Error(`process.json: '${key}' must be a list of strings`);
}

export function readConfig(root: string): ProcessConfig {
  const raw: unknown = JSON.parse(readText(join(root, "process.json")));
  if (typeof raw !== "object" || raw === null) {
    throw new Error("process.json must hold an object");
  }

  const config = Object.fromEntries(Object.entries(raw));
  const specTestFile = config.specTestFile;

  if (typeof specTestFile !== "string" || !specTestFile.includes("{module}")) {
    throw new Error(
      "process.json: 'specTestFile' must be a file name containing {module}, such as spec_{module}_test.go",
    );
  }

  return {
    designFiles: strings(config.designFiles, "designFiles"),
    areas: strings(config.areas, "areas"),
    specTestFile,
  };
}
