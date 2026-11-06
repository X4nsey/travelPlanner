/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'world-atlas/countries-110m.json' {
  const value: {
    type: 'Topology';
    objects: {
      countries: {
        type: 'GeometryCollection';
        geometries: Array<{
          type: string;
          id?: string;
          properties?: { name?: string };
          arcs: unknown;
        }>;
      };
      land: unknown;
    };
    arcs: unknown[];
  };
  export default value;
}
