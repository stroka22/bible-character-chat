/// <reference types="vite/client" />

/**
 * Type declarations for Vite environment variables
 * These provide TypeScript type safety when accessing import.meta.env
 */
interface ImportMetaEnv {
  /**
   * Supabase project URL
   * Used to connect to the Supabase instance
   */
  readonly VITE_SUPABASE_URL: string;
  
  /**
   * Supabase anonymous key
   * Used for public client-side authentication
   */
  readonly VITE_SUPABASE_ANON_KEY: string;
  
  /**
   * OpenAI API key
   * Used for GPT-4 chat completion requests
   * Note: For production, this should be kept server-side
   */
  readonly VITE_OPENAI_API_KEY: string;
  
  // Add other environment variables as needed
}

/**
 * Extends the global ImportMeta interface
 * Ensures proper typing when accessing import.meta.env
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
