const PREFIX = "GSTAND_";

export let host: string = process.env[PREFIX+"HOST"] ?? "localhost";
export let port: number = parseInt(process.env[PREFIX+"PORT"] ?? "3000");
export let protocol: string = process.env[PREFIX+"protocol"] ?? "http"
export let url: string = process.env[PREFIX+"URL"] ?? `${protocol}://${host}:${port}`;
// XXX Generate one at startup instead of using 32 'a's!
export let secret: string = process.env[PREFIX+"SECRET"] ?? "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

export let isPublicUrl: boolean = Boolean(process.env[PREFIX+"HOST"] || process.env[PREFIX+"URL"])
