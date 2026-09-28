import * as THREE from 'three';
import { ModelObject, SnapResult, Vector3D } from '../types/model';

export const SNAP_TOLERANCE_PX = 18; // screen pixels for geometry snapping
export const AXIS_SNAP_TOLERANCE_MM = 70; // mm for axis inference snapping

export interface SnapContext {
  pointerScreen: { x: number; y: number }; // normalized device coordinates or screen px
  raycaster: THREE.Raycaster;
  camera: THREE.Camera;
  groundPlane: THREE.Plane;
  sceneObjects: ModelObject[];
  referencePoint?: Vector3D | null; // e.g. Start point of current line/move
  activeGridStepMm: number; // e.g. 100, 500, 1000 mm
  enableGridSnap: boolean;
  enableGeometrySnap: boolean;
  enableAxisSnap: boolean;
}

/**
 * Calculates the best snap point based on geometry, axes, and grid
 */
export function calculateSnapPoint(ctx: SnapContext): SnapResult {
  const {
    raycaster,
    camera,
    groundPlane,
    sceneObjects,
    referencePoint,
    activeGridStepMm,
    enableGridSnap,
    enableGeometrySnap,
    enableAxisSnap,
  } = ctx;

  // Default intersection with ground plane Y = 0
  const groundIntersection = new THREE.Vector3();
  raycaster.ray.intersectPlane(groundPlane, groundIntersection);
  let currentCandidate: Vector3D = {
    x: groundIntersection ? groundIntersection.x : 0,
    y: groundIntersection ? groundIntersection.y : 0,
    z: groundIntersection ? groundIntersection.z : 0,
  };

  // 1. Geometry Snapping (Endpoints, Midpoints, Centers)
  if (enableGeometrySnap) {
    let closestDistSq = Infinity;
    let bestSnap: SnapResult | null = null;

    // Collect all candidate points from scene objects
    for (const obj of sceneObjects) {
      if (!obj.visible || obj.locked) continue;

      // Check object corners / vertices
      const vertices = getObjectVertices(obj);
      for (const v of vertices) {
        const screenPos = projectToScreen(v, camera);
        const distSq = distanceSq2D(screenPos, ctx.pointerScreen);
        if (distSq < SNAP_TOLERANCE_PX * SNAP_TOLERANCE_PX && distSq < closestDistSq) {
          closestDistSq = distSq;
          bestSnap = {
            point: { ...v },
            type: 'endpoint',
            label: 'Endpoint',
            color: '#22c55e', // Green
            targetId: obj.id,
          };
        }
      }

      // Check edge midpoints
      const edges = getObjectEdges(obj);
      for (const edge of edges) {
        const mid: Vector3D = {
          x: (edge.start.x + edge.end.x) / 2,
          y: (edge.start.y + edge.end.y) / 2,
          z: (edge.start.z + edge.end.z) / 2,
        };
        const screenPos = projectToScreen(mid, camera);
        const distSq = distanceSq2D(screenPos, ctx.pointerScreen);
        if (distSq < SNAP_TOLERANCE_PX * SNAP_TOLERANCE_PX && distSq < closestDistSq) {
          closestDistSq = distSq;
          bestSnap = {
            point: mid,
            type: 'midpoint',
            label: 'Midpoint',
            color: '#06b6d4', // Cyan
            targetId: obj.id,
          };
        }
      }

      // Check object center
      const center: Vector3D = {
        x: obj.position.x,
        y: obj.position.y + obj.dimensions.height / 2,
        z: obj.position.z,
      };
      const screenPos = projectToScreen(center, camera);
      const distSq = distanceSq2D(screenPos, ctx.pointerScreen);
      if (distSq < SNAP_TOLERANCE_PX * SNAP_TOLERANCE_PX && distSq < closestDistSq) {
        closestDistSq = distSq;
        bestSnap = {
          point: center,
          type: 'center',
          label: 'Center',
          color: '#ec4899', // Pink / Magenta
          targetId: obj.id,
        };
      }
    }

    if (bestSnap) {
      return bestSnap;
    }
  }

  // 2. Axis Inference Snapping (if drawing/moving relative to a reference point)
  if (enableAxisSnap && referencePoint) {
    const dx = currentCandidate.x - referencePoint.x;
    const dz = currentCandidate.z - referencePoint.z;
    const dy = currentCandidate.y - referencePoint.y;

    // Check Red Axis (aligned along X axis, so Z = refZ)
    if (Math.abs(dz) < AXIS_SNAP_TOLERANCE_MM * 2.5) {
      return {
        point: { x: currentCandidate.x, y: referencePoint.y, z: referencePoint.z },
        type: 'axisX',
        label: 'On Red Axis (X)',
        color: '#ef4444', // Red
        axisLine: {
          start: { x: referencePoint.x - 50000, y: referencePoint.y, z: referencePoint.z },
          end: { x: referencePoint.x + 50000, y: referencePoint.y, z: referencePoint.z },
        },
      };
    }

    // Check Green Axis (aligned along Z axis, so X = refX)
    if (Math.abs(dx) < AXIS_SNAP_TOLERANCE_MM * 2.5) {
      return {
        point: { x: referencePoint.x, y: referencePoint.y, z: currentCandidate.z },
        type: 'axisZ',
        label: 'On Green Axis (Z)',
        color: '#10b981', // Green
        axisLine: {
          start: { x: referencePoint.x, y: referencePoint.y, z: referencePoint.z - 50000 },
          end: { x: referencePoint.x, y: referencePoint.y, z: referencePoint.z + 50000 },
        },
      };
    }

    // Check Blue Axis (vertical Y axis)
    if (Math.abs(dx) < AXIS_SNAP_TOLERANCE_MM && Math.abs(dz) < AXIS_SNAP_TOLERANCE_MM) {
      return {
        point: { x: referencePoint.x, y: currentCandidate.y, z: referencePoint.z },
        type: 'axisY',
        label: 'On Blue Axis (Y)',
        color: '#3b82f6', // Blue
        axisLine: {
          start: { x: referencePoint.x, y: -50000, z: referencePoint.z },
          end: { x: referencePoint.x, y: 50000, z: referencePoint.z },
        },
      };
    }
  }

  // 3. Grid Snapping
  if (enableGridSnap && activeGridStepMm > 0) {
    const snappedX = Math.round(currentCandidate.x / activeGridStepMm) * activeGridStepMm;
    const snappedZ = Math.round(currentCandidate.z / activeGridStepMm) * activeGridStepMm;
    const distToGrid = Math.hypot(currentCandidate.x - snappedX, currentCandidate.z - snappedZ);

    if (distToGrid < activeGridStepMm * 0.45) {
      return {
        point: { x: snappedX, y: currentCandidate.y, z: snappedZ },
        type: 'grid',
        label: `Grid (${snappedX}, ${snappedZ})`,
        color: '#94a3b8',
      };
    }
  }

  // No special snap, return free ground point
  return {
    point: currentCandidate,
    type: 'none',
    label: '',
    color: '#64748b',
  };
}

function projectToScreen(p: Vector3D, camera: THREE.Camera): { x: number; y: number } {
  const v = new THREE.Vector3(p.x, p.y, p.z);
  v.project(camera);
  // Convert from NDC (-1 to 1) to viewport pixel space (approximate 0 to window size)
  const x = ((v.x + 1) * window.innerWidth) / 2;
  const y = ((-v.y + 1) * window.innerHeight) / 2;
  return { x, y };
}

function distanceSq2D(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function getObjectVertices(obj: ModelObject): Vector3D[] {
  const { position, dimensions } = obj;
  const { width, height, depth } = dimensions;
  const halfW = width / 2;
  const halfD = depth / 2;

  if (obj.faces && obj.faces.length > 0) {
    const list: Vector3D[] = [];
    for (const f of obj.faces) {
      for (const p of f.points) {
        list.push({
          x: p.x + position.x,
          y: p.y + position.y,
          z: p.z + position.z,
        });
      }
    }
    return list;
  }

  // Standard box corners
  return [
    { x: position.x - halfW, y: position.y, z: position.z - halfD },
    { x: position.x + halfW, y: position.y, z: position.z - halfD },
    { x: position.x + halfW, y: position.y, z: position.z + halfD },
    { x: position.x - halfW, y: position.y, z: position.z + halfD },
    { x: position.x - halfW, y: position.y + height, z: position.z - halfD },
    { x: position.x + halfW, y: position.y + height, z: position.z - halfD },
    { x: position.x + halfW, y: position.y + height, z: position.z + halfD },
    { x: position.x - halfW, y: position.y + height, z: position.z + halfD },
  ];
}

export function getObjectEdges(obj: ModelObject): { start: Vector3D; end: Vector3D }[] {
  const verts = getObjectVertices(obj);
  if (verts.length === 8) {
    // Box 12 edges
    return [
      // Bottom loop
      { start: verts[0], end: verts[1] },
      { start: verts[1], end: verts[2] },
      { start: verts[2], end: verts[3] },
      { start: verts[3], end: verts[0] },
      // Top loop
      { start: verts[4], end: verts[5] },
      { start: verts[5], end: verts[6] },
      { start: verts[6], end: verts[7] },
      { start: verts[7], end: verts[4] },
      // Vertical pillars
      { start: verts[0], end: verts[4] },
      { start: verts[1], end: verts[5] },
      { start: verts[2], end: verts[6] },
      { start: verts[3], end: verts[7] },
    ];
  }

  // 4-vertex polygon / flat face
  if (verts.length === 4) {
    return [
      { start: verts[0], end: verts[1] },
      { start: verts[1], end: verts[2] },
      { start: verts[2], end: verts[3] },
      { start: verts[3], end: verts[0] },
    ];
  }

  return [];
}
