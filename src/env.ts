import { randomBytes } from 'node:crypto';
import 'dotenv/config';

const PREFIX = "GSTAND_";

export const host: string = process.env[PREFIX + "HOST"] ?? "localhost";
export const port: number = parseInt(process.env[PREFIX + "PORT"] ?? "3000");
export const protocol: string = process.env[PREFIX + "protocol"] ?? "http"
export const url: string = (() => {
  const url = process.env[PREFIX + "URL"];
  if (url === null || url === undefined || url === "")
    return `${protocol}://${host}:${port}`;
  else return url
})();
export const secret: string = process.env[PREFIX + "SECRET"] ?? randomBytes(33).toString('base64')

export const dbType: string = process.env[PREFIX + "DB_TYPE"] ?? "sqlite";
export const dbPath: string = process.env[PREFIX + "DB_PATH"] ?? ":memory:"
export const dbHost: string = process.env[PREFIX + "DB_HOST"] ?? "localhost";
export const dbPort: number = parseInt(process.env[PREFIX + "DB_PORT"] ?? "5432");
export const dbUsername: string = process.env[PREFIX + "DB_USERNAME"] ?? "psql";
export const dbPassword: string = process.env[PREFIX + "DB_PASSWORD"] ?? "";
export const dbDatabase: string = process.env[PREFIX + "DB_DATABASE"] ?? "gstand";

export const loglevel: string = process.env[PREFIX + "LOG_LEVEL"] ?? "none";

export const firehoseRelay: string = process.env[PREFIX + "FIREHOSE_RELAY"] ?? "wss://bsky.network";

export const isPublicUrl: boolean = host !== "localhost";
