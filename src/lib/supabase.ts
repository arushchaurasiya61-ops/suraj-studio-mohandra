import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function authClient(): SupabaseClient<any, any, any> {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  ) as SupabaseClient<any, any, any>;
}

let serviceClient: SupabaseClient<any, any, any> | null = null;

export function db(): SupabaseClient<any, any, any> {
  if (!serviceClient) {
    serviceClient = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    ) as SupabaseClient<any, any, any>;
  }

  return serviceClient;
}