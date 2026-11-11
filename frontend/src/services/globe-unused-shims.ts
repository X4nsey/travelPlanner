/**
 * Lightweight no-op stubs for optional ThreeGlobe layers not used by TravelPlanner:
 * - WebGPU compute heatmaps (three/webgpu, three/tsl) — TravelPlanner uses standard WebGLRenderer
 * - H3 hexagonal binning (h3-js Emscripten WASM) — TravelPlanner uses GeoJSON country polygons
 */
export class WebGPURenderer {}
export class StorageInstancedBufferAttribute {}

// Stubs for h3-js
export function latLngToCell(): string {
  return '';
}
export function cellToLatLng(): [number, number] {
  return [0, 0];
}
export function cellToBoundary(): Array<[number, number]> {
  return [];
}
export function polygonToCells(): string[] {
  return [];
}

// Stubs for three/tsl
export const Fn = () => () => ({ compute: () => ({}) });
export const If = () => {};
export const uniform = () => ({});
export const storage = () => ({ element: () => ({ assign: () => {}, addAssign: () => {} }) });
export const float = () => ({ mul: () => ({}), div: () => ({}), sub: () => ({}), add: () => ({}) });
export const instanceIndex = 0;
export const Loop = () => {};
export const sqrt = () => ({});
export const sin = () => ({});
export const cos = () => ({});
export const asin = () => ({});
export const exp = () => ({});
export const negate = () => ({});
