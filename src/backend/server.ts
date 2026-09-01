// Filename: server.ts
// Version: 0.2.1

// wrangler code for exporting to Foodlog back-end application
export interface Env {
  FOODLOG_SECURE_KV: KVNamespace;
  FOODLOG_CONFIG_KV: KVNamespace;
  FOODLOG_CLIENT_ID: string;
  FOODLOG_CLIENT_SECRET: string;
}