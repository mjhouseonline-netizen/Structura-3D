export type UnitType = 'mm' | 'cm' | 'm' | 'in' | 'ft';

export type ToolType =
  | 'select'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'polygon'
  | 'pushpull'
  | 'wall'
  | 'room'
  | 'door'
  | 'window'
  | 'move'
  | 'rotate'
  | 'scale'
  | 'measure'
  | 'paint'
  | 'erase'
  | 'orbit'
  | 'pan';

export type ObjectTag =
  | 'structure'
  | 'walls'
  | 'doors'
  | 'windows'
  | 'furniture'
  | 'kitchen'
  | 'bathroom'
  | 'decor'
  | 'shapes';

export type GeometryType =
  | 'face'
  | 'wall'
  | 'room'
  | 'box'
  | 'cylinder'
  | 'door'
  | 'window'
  | 'component'
  | 'mesh';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface FaceData {
  id: string;
  points: Vector3D[];
  normal: Vector3D;
  area: number;
  materialId?: string;
  color?: string;
}

export interface ModelObject {
  id: string;
  name: string;
  type: GeometryType;
  tag: ObjectTag;
  position: Vector3D;
  rotation: Vector3D; // in radians or degrees
  scale: Vector3D;
  dimensions: {
    width: number;
    height: number;
    depth: number;
    thickness?: number;
    radius?: number;
    sides?: number;
  };
  materialId?: string;
  color?: string;
  visible: boolean;
  locked: boolean;
  groupId?: string;
  // Specific data for parametric architectural elements
  architecturalProps?: {
    wallId?: string;
    sillHeight?: number;
    openDirection?: 'left' | 'right' | 'in' | 'out';
    wallThickness?: number;
    componentType?: string;
  };
  // Explicit face list for drawn polygons and push/pulled surfaces
  faces?: FaceData[];
  edges?: { start: Vector3D; end: Vector3D }[];
}

export interface SnapResult {
  point: Vector3D;
  type: 'endpoint' | 'midpoint' | 'center' | 'edge' | 'face' | 'grid' | 'axisX' | 'axisY' | 'axisZ' | 'none';
  label: string;
  color: string;
  targetId?: string;
  axisLine?: { start: Vector3D; end: Vector3D };
}

export interface SavedScene {
  id: string;
  name: string;
  cameraPosition: Vector3D;
  targetPosition: Vector3D;
  zoom: number;
  fov?: number;
}

export interface DesignPage {
  id: string;
  title: string;
  type: '3d-space' | '2d-layout';
  objects: ModelObject[];
  savedScenes: SavedScene[];
  notes?: string;
  scale?: string;
  createdAt: string;
}

export interface TagInfo {
  id: ObjectTag;
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
}

export interface MaterialDef {
  id: string;
  name: string;
  category: 'paint' | 'wood' | 'flooring' | 'tiles' | 'stone' | 'concrete' | 'metal' | 'glass' | 'fabric';
  color: string;
  roughness: number;
  metalness: number;
  opacity?: number;
  transparent?: boolean;
  texturePattern?: string; // e.g. 'wood-planks', 'tiles-grid', 'marble', 'concrete-speck'
}

export interface HistoryEntry {
  id: string;
  description: string;
  timestamp: number;
  objectsState: ModelObject[];
}

export interface AICommandLog {
  id: string;
  prompt: string;
  explanation: string;
  commandsCount: number;
  timestamp: number;
  snapshotState: ModelObject[];
}

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  unit: UnitType;
  version: string;
}
