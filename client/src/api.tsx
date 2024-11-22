import { hc } from 'hono/client';
import type { AppType } from "#/routes";

export const client = hc<AppType>("/");
