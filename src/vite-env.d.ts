/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_GENERATIVE_LANGUAGE_CLIENT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
