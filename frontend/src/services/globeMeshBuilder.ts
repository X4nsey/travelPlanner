import * as THREE from 'three';
import { getWorldBorderLines, type GlobePolygonFeature } from '@/services/geo.service';

export const GLOBE_RADIUS = 100;
export const COUNTRIES_RADIUS = GLOBE_RADIUS * 1.003;
export const BORDERS_RADIUS = GLOBE_RADIUS * 1.007;
export const SELECTED_OUTLINE_RADIUS = GLOBE_RADIUS * 1.01;
export const PIN_RADIUS = GLOBE_RADIUS * 1.018;
export const ATMOSPHERE_RADIUS = GLOBE_RADIUS * 1.14;

// Pre-allocated vertex capacity for the single reusable selected-country outline buffer
// (largest country outline in world-atlas 110m is Canada at 1,532 vertices)
export const SELECTED_OUTLINE_INITIAL_VERTEX_CAPACITY = 2048;

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const MAX_TRI_EDGE_LEN = 0.078; // ~4.5 deg on unit sphere (sagitta < 0.001R, ~15k tris total)
const MAX_BORDER_STEP = 0.035; // ~2.0 deg on unit sphere (sagitta < 0.00016R, ~7.1k segments)

type Vec3Tuple = [number, number, number];
type LngLat = [number, number];

export interface VertexRange {
  start: number;
  count: number;
}

interface UnwrappedPolygon {
  outer: LngLat[];
  holes: LngLat[][];
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

export interface CountryPickEntry {
  id: string;
  polygons: UnwrappedPolygon[];
}

export interface CachedCountriesSurfaceData {
  positions: Float32Array;
  normals: Float32Array;
  vertexCount: number;
  featureVertexRanges: Map<string, VertexRange>;
  pickData: CountryPickEntry[];
}

// Module-level caches for static spherical geometry derived from world-atlas TopoJSON
let cachedSurfaceData: CachedCountriesSurfaceData | null = null;
let cachedBorderPositions: Float32Array | null = null;

export function latLngToUnitTuple(lat: number, lng: number): Vec3Tuple {
  const phi = (90 - lat) * DEG2RAD;
  const lam = lng * DEG2RAD;
  const sinPhi = Math.sin(phi);
  return [sinPhi * Math.sin(lam), Math.cos(phi), sinPhi * Math.cos(lam)];
}

export function latLngToVec3(
  lat: number,
  lng: number,
  radius: number,
  target = new THREE.Vector3()
): THREE.Vector3 {
  const phi = (90 - lat) * DEG2RAD;
  const lam = lng * DEG2RAD;
  const sinPhi = Math.sin(phi);
  return target.set(
    radius * sinPhi * Math.sin(lam),
    radius * Math.cos(phi),
    radius * sinPhi * Math.cos(lam)
  );
}

export function vec3ToLatLng(vec: THREE.Vector3): { lat: number; lng: number } {
  const len = vec.length() || 1;
  const yNorm = Math.max(-1, Math.min(1, vec.y / len));
  return {
    lat: Math.asin(yNorm) * RAD2DEG,
    lng: Math.atan2(vec.x, vec.z) * RAD2DEG,
  };
}

function unwrapRing(ring: LngLat[]): LngLat[] {
  if (ring.length === 0) return [];
  const out: LngLat[] = [[ring[0][0], ring[0][1]]];
  let offset = 0;

  for (let i = 1; i < ring.length; i++) {
    let lng = ring[i][0] + offset;
    const prevLng = out[i - 1][0];
    if (lng - prevLng > 180) {
      offset -= 360;
      lng -= 360;
    } else if (lng - prevLng < -180) {
      offset += 360;
      lng += 360;
    }
    out.push([lng, ring[i][1]]);
  }
  return out;
}

function midpointOnUnitSphere(a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple {
  const mx = a[0] + b[0];
  const my = a[1] + b[1];
  const mz = a[2] + b[2];
  const len = Math.hypot(mx, my, mz) || 1;
  return [mx / len, my / len, mz / len];
}

function subdivideSphericalTriangle(
  a: Vec3Tuple,
  b: Vec3Tuple,
  c: Vec3Tuple,
  out: Vec3Tuple[],
  depth = 0
): void {
  const dab = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const dbc = Math.hypot(b[0] - c[0], b[1] - c[1], b[2] - c[2]);
  const dca = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);

  const sAB = dab > MAX_TRI_EDGE_LEN;
  const sBC = dbc > MAX_TRI_EDGE_LEN;
  const sCA = dca > MAX_TRI_EDGE_LEN;

  if ((!sAB && !sBC && !sCA) || depth >= 6) {
    out.push(a, b, c);
    return;
  }

  const nextDepth = depth + 1;

  if (sAB && sBC && sCA) {
    const ab = midpointOnUnitSphere(a, b);
    const bc = midpointOnUnitSphere(b, c);
    const ca = midpointOnUnitSphere(c, a);
    subdivideSphericalTriangle(a, ab, ca, out, nextDepth);
    subdivideSphericalTriangle(ab, b, bc, out, nextDepth);
    subdivideSphericalTriangle(ca, bc, c, out, nextDepth);
    subdivideSphericalTriangle(ab, bc, ca, out, nextDepth);
  } else if (sAB && sBC) {
    const ab = midpointOnUnitSphere(a, b);
    const bc = midpointOnUnitSphere(b, c);
    subdivideSphericalTriangle(ab, b, bc, out, nextDepth);
    subdivideSphericalTriangle(a, ab, bc, out, nextDepth);
    subdivideSphericalTriangle(a, bc, c, out, nextDepth);
  } else if (sBC && sCA) {
    const bc = midpointOnUnitSphere(b, c);
    const ca = midpointOnUnitSphere(c, a);
    subdivideSphericalTriangle(bc, c, ca, out, nextDepth);
    subdivideSphericalTriangle(b, bc, ca, out, nextDepth);
    subdivideSphericalTriangle(b, ca, a, out, nextDepth);
  } else if (sCA && sAB) {
    const ca = midpointOnUnitSphere(c, a);
    const ab = midpointOnUnitSphere(a, b);
    subdivideSphericalTriangle(ca, a, ab, out, nextDepth);
    subdivideSphericalTriangle(c, ca, ab, out, nextDepth);
    subdivideSphericalTriangle(c, ab, b, out, nextDepth);
  } else if (sAB) {
    const ab = midpointOnUnitSphere(a, b);
    subdivideSphericalTriangle(a, ab, c, out, nextDepth);
    subdivideSphericalTriangle(ab, b, c, out, nextDepth);
  } else if (sBC) {
    const bc = midpointOnUnitSphere(b, c);
    subdivideSphericalTriangle(b, bc, a, out, nextDepth);
    subdivideSphericalTriangle(bc, c, a, out, nextDepth);
  } else {
    const ca = midpointOnUnitSphere(c, a);
    subdivideSphericalTriangle(c, ca, b, out, nextDepth);
    subdivideSphericalTriangle(ca, a, b, out, nextDepth);
  }
}

/**
 * Builds and caches the merged spherical surface mesh for all countries (~15k triangles)
 * plus per-country vertex ranges (for O(1) color repaint) and bbox-accelerated picking data.
 */
export function getCountriesSurfaceData(
  features: GlobePolygonFeature[]
): CachedCountriesSurfaceData {
  if (cachedSurfaceData) {
    return cachedSurfaceData;
  }

  const unitVertices: Vec3Tuple[] = [];
  const featureVertexRanges = new Map<string, VertexRange>();
  const pickData: CountryPickEntry[] = [];

  for (const feat of features) {
    const geom = feat.geometry;
    if (!geom || !geom.coordinates) continue;

    const polygonsRaw: LngLat[][][] =
      geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;

    const startVertex = unitVertices.length;
    const pickPolygons: UnwrappedPolygon[] = [];

    for (const poly of polygonsRaw) {
      if (!poly || !poly[0] || poly[0].length < 3) continue;

      const unwrappedOuter = unwrapRing(poly[0]);
      let minLng = Infinity;
      let maxLng = -Infinity;
      let minLat = Infinity;
      let maxLat = -Infinity;

      for (const [lng, lat] of unwrappedOuter) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }

      const outerVec2 = unwrappedOuter.map(([lng, lat]) => new THREE.Vector2(lng, lat));
      if (outerVec2.length > 1 && outerVec2[0].equals(outerVec2[outerVec2.length - 1])) {
        outerVec2.pop();
      }
      if (outerVec2.length < 3) continue;

      const unwrappedHoles: LngLat[][] = [];
      const holeVec2s: THREE.Vector2[][] = [];

      for (let h = 1; h < poly.length; h++) {
        if (!poly[h] || poly[h].length < 3) continue;
        const uh = unwrapRing(poly[h]);
        unwrappedHoles.push(uh);
        const hv = uh.map(([lng, lat]) => new THREE.Vector2(lng, lat));
        if (hv.length > 1 && hv[0].equals(hv[hv.length - 1])) {
          hv.pop();
        }
        if (hv.length >= 3) {
          holeVec2s.push(hv);
        }
      }

      pickPolygons.push({
        outer: unwrappedOuter,
        holes: unwrappedHoles,
        minLng,
        maxLng,
        minLat,
        maxLat,
      });

      const faces = THREE.ShapeUtils.triangulateShape(outerVec2, holeVec2s);
      const allPts: THREE.Vector2[] = [...outerVec2];
      for (const hole of holeVec2s) {
        allPts.push(...hole);
      }

      for (const [i0, i1, i2] of faces) {
        const p0 = allPts[i0];
        const p1 = allPts[i1];
        const p2 = allPts[i2];
        if (!p0 || !p1 || !p2) continue;

        let a = latLngToUnitTuple(p0.y, p0.x);
        let b = latLngToUnitTuple(p1.y, p1.x);
        let c = latLngToUnitTuple(p2.y, p2.x);

        // Enforce outward-facing winding so FrontSide rendering is crisp and artifact-free
        const ux = b[0] - a[0];
        const uy = b[1] - a[1];
        const uz = b[2] - a[2];
        const vx = c[0] - a[0];
        const vy = c[1] - a[1];
        const vz = c[2] - a[2];
        const nx = uy * vz - uz * vy;
        const ny = uz * vx - ux * vz;
        const nz = ux * vy - uy * vx;
        const dot =
          nx * (a[0] + b[0] + c[0]) +
          ny * (a[1] + b[1] + c[1]) +
          nz * (a[2] + b[2] + c[2]);

        if (dot < 0) {
          const tmp = b;
          b = c;
          c = tmp;
        }

        subdivideSphericalTriangle(a, b, c, unitVertices);
      }
    }

    const vertexCount = unitVertices.length - startVertex;
    if (vertexCount > 0) {
      featureVertexRanges.set(feat.id, { start: startVertex, count: vertexCount });
    }
    if (pickPolygons.length > 0) {
      pickData.push({ id: feat.id, polygons: pickPolygons });
    }
  }

  const totalVertices = unitVertices.length;
  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);

  for (let i = 0; i < totalVertices; i++) {
    const v = unitVertices[i];
    const idx = i * 3;
    positions[idx] = v[0] * COUNTRIES_RADIUS;
    positions[idx + 1] = v[1] * COUNTRIES_RADIUS;
    positions[idx + 2] = v[2] * COUNTRIES_RADIUS;
    normals[idx] = v[0];
    normals[idx + 1] = v[1];
    normals[idx + 2] = v[2];
  }

  cachedSurfaceData = {
    positions,
    normals,
    vertexCount: totalVertices,
    featureVertexRanges,
    pickData,
  };
  return cachedSurfaceData;
}

function appendSphericalPolylineSegments(
  coords: LngLat[],
  radius: number,
  out: number[]
): void {
  if (!coords || coords.length < 2) return;

  for (let i = 1; i < coords.length; i++) {
    const a = latLngToUnitTuple(coords[i - 1][1], coords[i - 1][0]);
    const b = latLngToUnitTuple(coords[i][1], coords[i][0]);
    const dist = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    if (dist < 1e-6) continue;

    const steps = Math.max(1, Math.ceil(dist / MAX_BORDER_STEP));
    let px = a[0] * radius;
    let py = a[1] * radius;
    let pz = a[2] * radius;

    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const ix = a[0] + (b[0] - a[0]) * t;
      const iy = a[1] + (b[1] - a[1]) * t;
      const iz = a[2] + (b[2] - a[2]) * t;
      const invLen = radius / (Math.hypot(ix, iy, iz) || 1);
      const qx = ix * invLen;
      const qy = iy * invLen;
      const qz = iz * invLen;

      out.push(px, py, pz, qx, qy, qz);
      px = qx;
      py = qy;
      pz = qz;
    }
  }
}

/**
 * Returns cached deduplicated border segment coordinates at BORDERS_RADIUS (R * 1.007).
 */
export function getWorldBordersPositions(): Float32Array {
  if (cachedBorderPositions) return cachedBorderPositions;

  const lines = getWorldBorderLines();
  const segments: number[] = [];
  for (const line of lines) {
    appendSphericalPolylineSegments(line, BORDERS_RADIUS, segments);
  }

  cachedBorderPositions = new Float32Array(segments);
  return cachedBorderPositions;
}

// Module-level cache of single-country outline coordinates so re-clicking any country is O(1)
const cachedFeatureOutlines = new Map<string, Float32Array>();

/**
 * Returns cached highlight border segment positions for a single selected country at SELECTED_OUTLINE_RADIUS.
 */
export function getFeatureOutlinePositions(feat: GlobePolygonFeature): Float32Array {
  const existing = cachedFeatureOutlines.get(feat.id);
  if (existing) return existing;

  const geom = feat.geometry;
  if (!geom || !geom.coordinates) return new Float32Array(0);

  const polygonsRaw: LngLat[][][] =
    geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;

  const segments: number[] = [];
  for (const poly of polygonsRaw) {
    if (!poly) continue;
    for (const ring of poly) {
      appendSphericalPolylineSegments(ring, SELECTED_OUTLINE_RADIUS, segments);
    }
  }

  const result = new Float32Array(segments);
  cachedFeatureOutlines.set(feat.id, result);
  return result;
}

function pointInRing2D(lng: number, lat: number, ring: LngLat[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersects =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/**
 * Analytical ray-sphere intersection + bbox-filtered 2D point-in-polygon country lookup (~0.01ms).
 * Avoids expensive Three.js triangle raycasting against hundreds of meshes.
 */
export function pickCountryIdByRay(
  ray: THREE.Ray,
  pickSphere: THREE.Sphere,
  pickData: CountryPickEntry[],
  hitPointScratch: THREE.Vector3
): string | null {
  const hit = ray.intersectSphere(pickSphere, hitPointScratch);
  if (!hit) return null;

  const { lat, lng } = vec3ToLatLng(hit);

  for (let i = 0; i < pickData.length; i++) {
    const entry = pickData[i];
    const polys = entry.polygons;

    for (let p = 0; p < polys.length; p++) {
      const poly = polys[p];
      if (lat < poly.minLat || lat > poly.maxLat) continue;

      let testLng = lng;
      let matched = false;

      if (testLng >= poly.minLng && testLng <= poly.maxLng) {
        matched = isInsidePolygonWithHoles(testLng, lat, poly);
      }

      if (!matched && poly.maxLng > 180) {
        testLng = lng + 360;
        if (testLng >= poly.minLng && testLng <= poly.maxLng) {
          matched = isInsidePolygonWithHoles(testLng, lat, poly);
        }
      }

      if (!matched && poly.minLng < -180) {
        testLng = lng - 360;
        if (testLng >= poly.minLng && testLng <= poly.maxLng) {
          matched = isInsidePolygonWithHoles(testLng, lat, poly);
        }
      }

      if (matched) return entry.id;
    }
  }

  return null;
}

function isInsidePolygonWithHoles(lng: number, lat: number, poly: UnwrappedPolygon): boolean {
  if (!pointInRing2D(lng, lat, poly.outer)) return false;
  for (let h = 0; h < poly.holes.length; h++) {
    if (pointInRing2D(lng, lat, poly.holes[h])) return false;
  }
  return true;
}

/**
 * Creates a crisp procedural ocean CanvasTexture with subtle latitude/longitude graticules.
 */
export function createOceanCanvasTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#082f49');
    grad.addColorStop(0.22, '#0c4a6e');
    grad.addColorStop(0.5, '#0369a1');
    grad.addColorStop(0.78, '#0c4a6e');
    grad.addColorStop(1, '#082f49');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(125, 211, 252, 0.13)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = Math.min(4, Math.max(1, maxAnisotropy));
  texture.needsUpdate = true;
  return texture;
}

/**
 * Lightweight BackSide Fresnel atmosphere halo shader (#38bdf8).
 */
export function createAtmosphereMaterial(hexColor = '#38bdf8'): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(hexColor) },
    },
    vertexShader: `
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;
      void main() {
        float rim = clamp(-dot(normalize(vWorldNormal), normalize(vViewDir)), 0.0, 1.0);
        float glow = pow(smoothstep(0.0, 0.52, rim), 2.35) * 0.62;
        gl_FragColor = vec4(uColor, glow);
      }
    `,
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}
