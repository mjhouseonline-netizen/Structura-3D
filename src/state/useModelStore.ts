import { useState, useEffect, useSyncExternalStore } from 'react';
import {
  ModelObject,
  ToolType,
  UnitType,
  ObjectTag,
  TagInfo,
  MaterialDef,
  SavedScene,
  HistoryEntry,
  AICommandLog,
  ProjectMetadata,
  Vector3D,
  DesignPage,
} from '../types/model';
import { PRESET_MATERIALS } from '../engine/materials';

export const DEFAULT_TAGS: TagInfo[] = [
  { id: 'structure', name: 'Structure', color: '#64748b', visible: true, locked: false },
  { id: 'walls', name: 'Walls', color: '#e2e8f0', visible: true, locked: false },
  { id: 'doors', name: 'Doors', color: '#93c5fd', visible: true, locked: false },
  { id: 'windows', name: 'Windows', color: '#38bdf8', visible: true, locked: false },
  { id: 'furniture', name: 'Furniture', color: '#f59e0b', visible: true, locked: false },
  { id: 'kitchen', name: 'Kitchen', color: '#10b981', visible: true, locked: false },
  { id: 'bathroom', name: 'Bathroom', color: '#06b6d4', visible: true, locked: false },
  { id: 'decor', name: 'Decor & Plants', color: '#ec4899', visible: true, locked: false },
  { id: 'shapes', name: 'Shapes & Faces', color: '#8b5cf6', visible: true, locked: false },
];

export interface ModelState {
  project: ProjectMetadata;
  objects: ModelObject[];
  selectedObjectIds: string[];
  selectedFaceId: string | null;
  activeTool: ToolType;
  activeUnit: UnitType;
  activeMaterialId: string;
  activeColor: string;
  activeWallHeight: number;
  activeWallThickness: number;
  activeRoomWidth: number;
  activeRoomLength: number;
  activeCircleSides: number;
  activePolygonSides: number;
  // Snapping
  enableGridSnap: boolean;
  enableGeometrySnap: boolean;
  enableAxisSnap: boolean;
  gridStepMm: number;
  // VCB
  vcbPrompt: string;
  vcbValue: string;
  statusHint: string;
  // Tags & Layers
  tags: TagInfo[];
  activeTag: ObjectTag;
  // Scenes
  savedScenes: SavedScene[];
  activeSceneId: string | null;
  // Pages & Sheets
  pages: DesignPage[];
  activePageId: string;
  // History
  history: HistoryEntry[];
  historyIndex: number;
  // AI
  aiLogs: AICommandLog[];
  isAiLoading: boolean;
  aiError: string | null;
  // UI Panels
  presentationMode: boolean;
  theme: 'light' | 'dark';
  isLibraryOpen: boolean;
  activeTab: 'properties' | 'library' | 'materials' | 'tags' | 'scenes' | 'ai';
  isTourOpen: boolean;
  tourStep: number;
  isTourWelcomeOpen: boolean;
  initialHelpSection: string;
  isInstructionsOpen: boolean;
  isHelpOpen: boolean;
  isInteractiveTutorialActive: boolean;
  tutorialCurrentStep: number;
  aiInputPrefill: string;
  dismissEmptyWorkspacePrompt: boolean;
  mobileTouchMode: 'orbit' | 'draw';
  isMobileDrawerOpen: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
}

// Initial Starter Project: A clean room with modern furnishings to immediately show the power of the tool!
const INITIAL_OBJECTS: ModelObject[] = [
  // Room Floor Slab
  {
    id: 'room-floor-1',
    name: 'Living Room Floor',
    type: 'box',
    tag: 'structure',
    position: { x: 0, y: -50, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: { width: 5000, height: 100, depth: 4000 },
    materialId: 'floor-oak-parquet',
    color: '#bfa079',
    visible: true,
    locked: false,
  },
  // Back Wall
  {
    id: 'wall-back-1',
    name: 'Back Wall',
    type: 'wall',
    tag: 'walls',
    position: { x: 0, y: 0, z: -2000 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: { width: 5000, height: 2600, depth: 150 },
    materialId: 'paint-warm-white',
    color: '#f4efe6',
    visible: true,
    locked: false,
  },
  // Left Wall
  {
    id: 'wall-left-1',
    name: 'Left Wall',
    type: 'wall',
    tag: 'walls',
    position: { x: -2500, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: { width: 150, height: 2600, depth: 4000 },
    materialId: 'paint-warm-white',
    color: '#f4efe6',
    visible: true,
    locked: false,
  },
  // Window on Back Wall
  {
    id: 'window-back-1',
    name: 'Panoramic Window',
    type: 'window',
    tag: 'windows',
    position: { x: 0, y: 800, z: -1980 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: { width: 2200, height: 1500, depth: 160 },
    materialId: 'metal-matte-black',
    visible: true,
    locked: false,
    architecturalProps: { componentType: 'window', sillHeight: 800 },
  },
  // Modern 3-seater Sofa
  {
    id: 'sofa-center-1',
    name: 'Modern Charcoal Sofa',
    type: 'component',
    tag: 'furniture',
    position: { x: 0, y: 0, z: 400 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: { width: 2200, height: 780, depth: 920 },
    materialId: 'fabric-charcoal-weave',
    color: '#374151',
    visible: true,
    locked: false,
    architecturalProps: { componentType: 'sofa3Seat' },
  },
  // Coffee Table
  {
    id: 'table-coffee-1',
    name: 'Minimalist Coffee Table',
    type: 'component',
    tag: 'furniture',
    position: { x: 0, y: 0, z: -400 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: { width: 1200, height: 420, depth: 650 },
    materialId: 'wood-natural-oak',
    visible: true,
    locked: false,
    architecturalProps: { componentType: 'coffeeTable' },
  },
  // Starter Extrudable Rectangle Demo Shape to test Push/Pull right away!
  {
    id: 'demo-rect-face',
    name: 'Push/Pull Work Face',
    type: 'face',
    tag: 'shapes',
    position: { x: 1500, y: 0, z: -800 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    dimensions: { width: 1200, height: 10, depth: 1000 },
    materialId: 'wood-natural-oak',
    color: '#c8a374',
    visible: true,
    locked: false,
    faces: [
      {
        id: 'face-0',
        points: [
          { x: -600, y: 0, z: -500 },
          { x: 600, y: 0, z: -500 },
          { x: 600, y: 0, z: 500 },
          { x: -600, y: 0, z: 500 },
        ],
        normal: { x: 0, y: 1, z: 0 },
        area: 1200 * 1000,
      },
    ],
  },
];

const initialProject: ProjectMetadata = {
  id: 'proj-default-1',
  name: 'Modern Studio Living Space',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  unit: 'mm',
  version: '1.0.0',
};

let currentState: ModelState = {
  project: initialProject,
  objects: INITIAL_OBJECTS,
  selectedObjectIds: [],
  selectedFaceId: null,
  activeTool: 'select',
  activeUnit: 'mm',
  activeMaterialId: 'paint-warm-white',
  activeColor: '#f4efe6',
  activeWallHeight: 2400,
  activeWallThickness: 150,
  activeRoomWidth: 5000,
  activeRoomLength: 4000,
  activeCircleSides: 32,
  activePolygonSides: 6,
  enableGridSnap: true,
  enableGeometrySnap: true,
  enableAxisSnap: true,
  gridStepMm: 500,
  vcbPrompt: 'Dimensions / Length:',
  vcbValue: '',
  statusHint: 'Click on objects to select. Switch tools in the left toolbar to draw or extrude.',
  tags: DEFAULT_TAGS,
  activeTag: 'furniture',
  savedScenes: [
    {
      id: 'scene-iso',
      name: 'Isometric Overview',
      cameraPosition: { x: 4500, y: 3500, z: 5500 },
      targetPosition: { x: 0, y: 500, z: 0 },
      zoom: 1,
    },
    {
      id: 'scene-front',
      name: 'Front View',
      cameraPosition: { x: 0, y: 1200, z: 5000 },
      targetPosition: { x: 0, y: 1200, z: 0 },
      zoom: 1,
    },
    {
      id: 'scene-top',
      name: 'Floor Plan (Top)',
      cameraPosition: { x: 0, y: 8000, z: 0 },
      targetPosition: { x: 0, y: 0, z: 0 },
      zoom: 1,
    },
  ],
  activeSceneId: 'scene-iso',
  pages: [
    {
      id: 'page-1',
      title: '3D Living Space',
      type: '3d-space',
      objects: INITIAL_OBJECTS,
      savedScenes: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'page-2',
      title: '2D LayOut Blueprint',
      type: '2d-layout',
      objects: INITIAL_OBJECTS,
      savedScenes: [],
      scale: '1:50',
      createdAt: new Date().toISOString(),
    },
  ],
  activePageId: 'page-1',
  history: [
    {
      id: 'hist-init',
      description: 'Initial scene',
      timestamp: Date.now(),
      objectsState: INITIAL_OBJECTS,
    },
  ],
  historyIndex: 0,
  aiLogs: [],
  isAiLoading: false,
  aiError: null,
  presentationMode: false,
  theme: 'dark',
  isLibraryOpen: false,
  activeTab: 'properties',
  isTourOpen: false,
  tourStep: 1,
  isTourWelcomeOpen: false,
  initialHelpSection: 'getting-started',
  isInstructionsOpen: false,
  isHelpOpen: false,
  isInteractiveTutorialActive: false,
  tutorialCurrentStep: 1,
  aiInputPrefill: '',
  dismissEmptyWorkspacePrompt: false,
  mobileTouchMode: 'orbit',
  isMobileDrawerOpen: false,
  saveStatus: 'saved',
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function getState(): ModelState {
  return currentState;
}

export function setState(updater: Partial<ModelState> | ((prev: ModelState) => Partial<ModelState>)) {
  if (typeof updater === 'function') {
    currentState = { ...currentState, ...updater(currentState) };
  } else {
    currentState = { ...currentState, ...updater };
  }
  emitChange();
}

/**
 * Pushes a snapshot to the undo/redo history stack
 */
export function pushHistory(description: string, newObjects?: ModelObject[]) {
  const objs = newObjects || currentState.objects;
  const newEntry: HistoryEntry = {
    id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    description,
    timestamp: Date.now(),
    objectsState: JSON.parse(JSON.stringify(objs)),
  };

  const truncatedHistory = currentState.history.slice(0, currentState.historyIndex + 1);
  truncatedHistory.push(newEntry);

  if (truncatedHistory.length > 50) {
    truncatedHistory.shift();
  }

  setState({
    objects: objs,
    history: truncatedHistory,
    historyIndex: truncatedHistory.length - 1,
    saveStatus: 'unsaved',
  });

  // Autosave locally
  debounceAutosave();
}

let autosaveTimeout: any = null;
function debounceAutosave() {
  if (autosaveTimeout) clearTimeout(autosaveTimeout);
  setState({ saveStatus: 'saving' });
  autosaveTimeout = setTimeout(() => {
    try {
      localStorage.setItem('structura_3d_project', JSON.stringify({
        project: currentState.project,
        objects: currentState.objects,
        savedScenes: currentState.savedScenes,
        tags: currentState.tags,
      }));
      setState({ saveStatus: 'saved' });
    } catch (e) {
      console.warn('Autosave failed:', e);
      setState({ saveStatus: 'unsaved' });
    }
  }, 1000);
}

// Global actions
export const modelActions = {
  setTool(tool: ToolType) {
    let prompt = 'Dimensions / Length:';
    let hint = '';
    switch (tool) {
      case 'select':
        hint = 'Click to select. Shift+click for multiple. Drag in empty space to orbit.';
        break;
      case 'line':
        prompt = 'Length:';
        hint = 'Click start point, then click endpoint. Closed loops form a face automatically.';
        break;
      case 'rectangle':
        prompt = 'Dimensions (W, D):';
        hint = 'Click first corner, drag, and click opposite corner to create a face.';
        break;
      case 'circle':
        prompt = 'Radius:';
        hint = 'Click center point, then click or type radius.';
        break;
      case 'polygon':
        prompt = 'Radius / Sides:';
        hint = 'Click center point, move mouse, or enter radius to create polygon face.';
        break;
      case 'pushpull':
        prompt = 'Extrusion Distance:';
        hint = 'Hover over any flat face, click and drag along normal to extrude into 3D!';
        break;
      case 'wall':
        prompt = 'Length, Thickness:';
        hint = 'Click start and endpoint to draw continuous 3D walls.';
        break;
      case 'room':
        prompt = 'Room (W, L):';
        hint = 'Click to place a complete room with 4 joined walls and a floor slab.';
        break;
      case 'move':
        prompt = 'Distance (dX, dZ):';
        hint = 'Select object, click base point and drag along axis or snap point.';
        break;
      case 'rotate':
        prompt = 'Angle (degrees):';
        hint = 'Click to set rotation pivot, drag or type angle (e.g. 45 or 90).';
        break;
      case 'scale':
        prompt = 'Scale factor:';
        hint = 'Drag corner handles to scale proportionally, or axis handles to stretch.';
        break;
      case 'measure':
        prompt = 'Distance:';
        hint = 'Click two points in the scene to measure exact distance.';
        break;
      case 'paint':
        hint = 'Click any face or object to apply active material / color.';
        break;
      case 'erase':
        hint = 'Click any object or face to delete it from the scene.';
        break;
    }
    setState({ activeTool: tool, vcbPrompt: prompt, statusHint: hint, vcbValue: '' });
  },

  setUnit(unit: UnitType) {
    setState((prev) => ({
      activeUnit: unit,
      project: { ...prev.project, unit, updatedAt: new Date().toISOString() },
    }));
  },

  setVcbValue(vcbValue: string) {
    setState({ vcbValue });
  },

  setStatusHint(statusHint: string) {
    setState({ statusHint });
  },

  selectObject(id: string, multi = false) {
    setState((prev) => {
      if (multi) {
        const set = new Set(prev.selectedObjectIds);
        if (set.has(id)) set.delete(id);
        else set.add(id);
        return { selectedObjectIds: Array.from(set) };
      }
      return { selectedObjectIds: [id], selectedFaceId: null };
    });
  },

  selectFace(objectId: string, faceId: string) {
    setState({ selectedObjectIds: [objectId], selectedFaceId: faceId });
  },

  deselectAll() {
    setState({ selectedObjectIds: [], selectedFaceId: null });
  },

  addObject(obj: ModelObject, description = `Added ${obj.name}`) {
    const updated = [...currentState.objects, obj];
    pushHistory(description, updated);
  },

  updateObject(id: string, updates: Partial<ModelObject>, description = 'Updated object') {
    const updated = currentState.objects.map((o) => (o.id === id ? { ...o, ...updates } : o));
    pushHistory(description, updated);
  },

  deleteSelected() {
    const idsToDelete = new Set(currentState.selectedObjectIds);
    if (idsToDelete.size === 0) return;
    const updated = currentState.objects.filter((o) => !idsToDelete.has(o.id));
    setState({ selectedObjectIds: [], selectedFaceId: null });
    pushHistory(`Deleted ${idsToDelete.size} object(s)`, updated);
  },

  duplicateSelected() {
    const idsToDup = currentState.selectedObjectIds;
    if (idsToDup.length === 0) return;
    const newObjects: ModelObject[] = [];
    const newSelectedIds: string[] = [];

    for (const obj of currentState.objects) {
      if (idsToDup.includes(obj.id)) {
        const copy: ModelObject = JSON.parse(JSON.stringify(obj));
        copy.id = `obj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        copy.name = `${obj.name} (Copy)`;
        copy.position.x += 400; // offset slightly
        copy.position.z += 400;
        newObjects.push(copy);
        newSelectedIds.push(copy.id);
      }
    }

    const updated = [...currentState.objects, ...newObjects];
    setState({ selectedObjectIds: newSelectedIds });
    pushHistory(`Duplicated ${idsToDup.length} object(s)`, updated);
  },

  /**
   * PUSH/PULL Extrusion:
   * Turns a 2D face into a 3D volumetric solid or modifies existing height!
   */
  pushPull(targetId: string, distanceMm: number) {
    const obj = currentState.objects.find((o) => o.id === targetId);
    if (!obj) return;

    if (obj.type === 'face') {
      // Convert 2D flat face into a 3D box or extruded volume
      const newHeight = Math.abs(distanceMm);
      const updated: ModelObject = {
        ...obj,
        type: 'box',
        dimensions: {
          width: obj.dimensions.width,
          height: newHeight,
          depth: obj.dimensions.depth,
        },
        position: {
          ...obj.position,
          y: distanceMm < 0 ? obj.position.y - newHeight : obj.position.y,
        },
        name: `${obj.name} (Extruded)`,
      };
      modelActions.updateObject(targetId, updated, `Push/Pull extruded ${obj.name} by ${Math.round(distanceMm)}mm`);
    } else {
      // Modify height of existing 3D solid
      const newHeight = Math.max(10, obj.dimensions.height + distanceMm);
      const updated: ModelObject = {
        ...obj,
        dimensions: { ...obj.dimensions, height: newHeight },
      };
      modelActions.updateObject(targetId, updated, `Push/Pull adjusted height by ${Math.round(distanceMm)}mm`);
    }
  },

  /**
   * Creates a complete room with 4 walls and floor slab
   */
  createRoom(
    width = 5000,
    length = 4000,
    wallHeight = 2600,
    wallThickness = 150,
    centerX = 0,
    centerZ = 0,
    floorMat = 'floor-oak-parquet',
    wallMat = 'paint-warm-white'
  ) {
    const timestamp = Date.now();
    const halfW = width / 2;
    const halfL = length / 2;

    const floor: ModelObject = {
      id: `floor-${timestamp}`,
      name: `Room Floor (${width}x${length})`,
      type: 'box',
      tag: 'structure',
      position: { x: centerX, y: -50, z: centerZ },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      dimensions: { width, height: 100, depth: length },
      materialId: floorMat,
      color: '#bfa079',
      visible: true,
      locked: false,
    };

    const backWall: ModelObject = {
      id: `wall-b-${timestamp}`,
      name: 'Room Back Wall',
      type: 'wall',
      tag: 'walls',
      position: { x: centerX, y: 0, z: centerZ - halfL },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      dimensions: { width, height: wallHeight, depth: wallThickness },
      materialId: wallMat,
      visible: true,
      locked: false,
    };

    const frontWall: ModelObject = {
      id: `wall-f-${timestamp}`,
      name: 'Room Front Wall',
      type: 'wall',
      tag: 'walls',
      position: { x: centerX, y: 0, z: centerZ + halfL },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      dimensions: { width, height: wallHeight, depth: wallThickness },
      materialId: wallMat,
      visible: true,
      locked: false,
    };

    const leftWall: ModelObject = {
      id: `wall-l-${timestamp}`,
      name: 'Room Left Wall',
      type: 'wall',
      tag: 'walls',
      position: { x: centerX - halfW, y: 0, z: centerZ },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      dimensions: { width: wallThickness, height: wallHeight, depth: length - wallThickness * 2 },
      materialId: wallMat,
      visible: true,
      locked: false,
    };

    const rightWall: ModelObject = {
      id: `wall-r-${timestamp}`,
      name: 'Room Right Wall',
      type: 'wall',
      tag: 'walls',
      position: { x: centerX + halfW, y: 0, z: centerZ },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      dimensions: { width: wallThickness, height: wallHeight, depth: length - wallThickness * 2 },
      materialId: wallMat,
      visible: true,
      locked: false,
    };

    const newObjs = [floor, backWall, frontWall, leftWall, rightWall];
    pushHistory(`Created room ${width}mm x ${length}mm`, [...currentState.objects, ...newObjs]);
  },

  /**
   * Applies active material or custom color to selected objects
   */
  applyActiveMaterial() {
    const { selectedObjectIds, activeMaterialId, activeColor } = currentState;
    if (selectedObjectIds.length === 0) return;

    const updated = currentState.objects.map((obj) => {
      if (selectedObjectIds.includes(obj.id)) {
        return { ...obj, materialId: activeMaterialId, color: activeColor };
      }
      return obj;
    });

    pushHistory(`Applied material to ${selectedObjectIds.length} object(s)`, updated);
  },

  /**
   * Undo and Redo
   */
  undo() {
    if (currentState.historyIndex > 0) {
      const newIndex = currentState.historyIndex - 1;
      const targetState = currentState.history[newIndex];
      setState({
        objects: JSON.parse(JSON.stringify(targetState.objectsState)),
        historyIndex: newIndex,
        selectedObjectIds: [],
        selectedFaceId: null,
      });
      debounceAutosave();
    }
  },

  redo() {
    if (currentState.historyIndex < currentState.history.length - 1) {
      const newIndex = currentState.historyIndex + 1;
      const targetState = currentState.history[newIndex];
      setState({
        objects: JSON.parse(JSON.stringify(targetState.objectsState)),
        historyIndex: newIndex,
        selectedObjectIds: [],
        selectedFaceId: null,
      });
      debounceAutosave();
    }
  },

  /**
   * AI Structured Command Executor
   */
  async executeAiPrompt(prompt: string) {
    setState({ isAiLoading: true, aiError: null });

    try {
      // Gather relevant scene context for Gemini
      const sceneSummary = {
        totalObjects: currentState.objects.length,
        selectedId: currentState.selectedObjectIds[0] || null,
        objects: currentState.objects.map((o) => ({
          id: o.id,
          name: o.name,
          type: o.type,
          tag: o.tag,
          componentType: o.architecturalProps?.componentType,
          position: o.position,
          dimensions: o.dimensions,
          material: o.materialId,
        })),
      };

      const res = await fetch('/api/gemini/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, sceneContext: sceneSummary }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const { commands, explanation } = data;

      if (!Array.isArray(commands)) {
        throw new Error('AI returned an unexpected command response format.');
      }

      // Snapshot current state for one-click AI undo
      const preAiObjects = JSON.parse(JSON.stringify(currentState.objects));

      // Execute structured commands sequentially
      let currentObjs = [...currentState.objects];

      for (const cmd of commands) {
        const { type, params } = cmd;
        switch (type) {
          case 'createRoom': {
            const w = params.width || 5000;
            const l = params.length || 4000;
            const h = params.wallHeight || 2600;
            const th = params.wallThickness || 150;
            const cx = params.centerX || 0;
            const cz = params.centerZ || 0;
            const fMat = params.flooringMaterial || 'floor-oak-parquet';
            const wMat = params.wallMaterial || 'paint-warm-white';
            const timestamp = Date.now();
            const halfW = w / 2;
            const halfL = l / 2;

            const roomObjs: ModelObject[] = [
              {
                id: `floor-${timestamp}-${Math.random().toString(36).substring(2, 6)}`,
                name: `Room Floor (${w}x${l})`,
                type: 'box',
                tag: 'structure',
                position: { x: cx, y: -50, z: cz },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                dimensions: { width: w, height: 100, depth: l },
                materialId: fMat,
                visible: true,
                locked: false,
              },
              {
                id: `wall-b-${timestamp}`,
                name: 'Back Wall',
                type: 'wall',
                tag: 'walls',
                position: { x: cx, y: 0, z: cz - halfL },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                dimensions: { width: w, height: h, depth: th },
                materialId: wMat,
                visible: true,
                locked: false,
              },
              {
                id: `wall-l-${timestamp}`,
                name: 'Left Wall',
                type: 'wall',
                tag: 'walls',
                position: { x: cx - halfW, y: 0, z: cz },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                dimensions: { width: th, height: h, depth: l - th * 2 },
                materialId: wMat,
                visible: true,
                locked: false,
              },
              {
                id: `wall-r-${timestamp}`,
                name: 'Right Wall',
                type: 'wall',
                tag: 'walls',
                position: { x: cx + halfW, y: 0, z: cz },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                dimensions: { width: th, height: h, depth: l - th * 2 },
                materialId: wMat,
                visible: true,
                locked: false,
              },
            ];
            currentObjs = [...currentObjs, ...roomObjs];
            break;
          }

          case 'createWall': {
            const sx = params.startX || 0;
            const sz = params.startZ || 0;
            const ex = params.endX || 2000;
            const ez = params.endZ || 0;
            const len = Math.hypot(ex - sx, ez - sz);
            const midX = (sx + ex) / 2;
            const midZ = (sz + ez) / 2;
            const angle = Math.atan2(ez - sz, ex - sx);

            const wallObj: ModelObject = {
              id: `wall-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: 'Wall Segment',
              type: 'wall',
              tag: 'walls',
              position: { x: midX, y: 0, z: midZ },
              rotation: { x: 0, y: -angle, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
              dimensions: {
                width: len,
                height: params.height || 2600,
                depth: params.thickness || 150,
              },
              materialId: params.material || 'paint-warm-white',
              visible: true,
              locked: false,
            };
            currentObjs.push(wallObj);
            break;
          }

          case 'createDoor': {
            const doorObj: ModelObject = {
              id: `door-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: 'Parametric Door',
              type: 'door',
              tag: 'doors',
              position: { x: params.x || 0, y: params.y || 0, z: params.z || 0 },
              rotation: { x: 0, y: ((params.rotation || 0) * Math.PI) / 180, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
              dimensions: {
                width: params.width || 900,
                height: params.height || 2100,
                depth: 150,
                thickness: 150,
              },
              materialId: 'wood-walnut',
              visible: true,
              locked: false,
              architecturalProps: { componentType: 'door' },
            };
            currentObjs.push(doorObj);
            break;
          }

          case 'createWindow': {
            const winObj: ModelObject = {
              id: `win-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: 'Parametric Window',
              type: 'window',
              tag: 'windows',
              position: { x: params.x || 0, y: params.sillHeight || 900, z: params.z || 0 },
              rotation: { x: 0, y: ((params.rotation || 0) * Math.PI) / 180, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
              dimensions: {
                width: params.width || 1200,
                height: params.height || 1400,
                depth: 150,
                thickness: 150,
              },
              materialId: 'metal-matte-black',
              visible: true,
              locked: false,
              architecturalProps: { componentType: 'window', sillHeight: params.sillHeight || 900 },
            };
            currentObjs.push(winObj);
            break;
          }

          case 'createObject': {
            const objType = params.objectType || 'coffeeTable';
            const defaultDims = getDefaultDimensionsForType(objType);
            const w = params.width || defaultDims.w;
            const h = params.height || defaultDims.h;
            const d = params.depth || defaultDims.d;
            const tag = getTagForType(objType);

            const compObj: ModelObject = {
              id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: params.name || formatComponentName(objType),
              type: 'component',
              tag,
              position: { x: params.x || 0, y: params.y || 0, z: params.z || 0 },
              rotation: { x: 0, y: ((params.rotation || 0) * Math.PI) / 180, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
              dimensions: { width: w, height: h, depth: d },
              materialId: params.material || defaultDims.material,
              visible: true,
              locked: false,
              architecturalProps: { componentType: objType },
            };
            currentObjs.push(compObj);
            break;
          }

          case 'createBox': {
            const boxObj: ModelObject = {
              id: `box-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: params.name || 'Solid Volume',
              type: 'box',
              tag: 'shapes',
              position: { x: params.x || 0, y: params.y || 0, z: params.z || 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
              dimensions: {
                width: params.width || 1000,
                height: params.height || 1000,
                depth: params.depth || 1000,
              },
              materialId: params.material || 'wood-natural-oak',
              visible: true,
              locked: false,
            };
            currentObjs.push(boxObj);
            break;
          }

          case 'moveObject': {
            if (params.id) {
              currentObjs = currentObjs.map((o) => {
                if (o.id === params.id) {
                  return {
                    ...o,
                    position: {
                      x: o.position.x + (params.deltaX || 0),
                      y: o.position.y + (params.deltaY || 0),
                      z: o.position.z + (params.deltaZ || 0),
                    },
                  };
                }
                return o;
              });
            }
            break;
          }

          case 'rotateObject': {
            if (params.id) {
              currentObjs = currentObjs.map((o) => {
                if (o.id === params.id) {
                  return {
                    ...o,
                    rotation: {
                      ...o.rotation,
                      y: o.rotation.y + (((params.angleDelta || 0) * Math.PI) / 180),
                    },
                  };
                }
                return o;
              });
            }
            break;
          }

          case 'deleteObject': {
            if (params.id) {
              currentObjs = currentObjs.filter((o) => o.id !== params.id);
            }
            break;
          }

          case 'changeMaterial': {
            if (params.id) {
              currentObjs = currentObjs.map((o) => {
                if (o.id === params.id) {
                  return { ...o, materialId: params.material || o.materialId, color: params.color || o.color };
                }
                return o;
              });
            }
            break;
          }

          case 'clearScene': {
            currentObjs = [];
            break;
          }
        }
      }

      const logEntry: AICommandLog = {
        id: `ai-${Date.now()}`,
        prompt,
        explanation: explanation || 'Updated 3D design model.',
        commandsCount: commands.length,
        timestamp: Date.now(),
        snapshotState: preAiObjects,
      };

      const updatedLogs = [logEntry, ...currentState.aiLogs];
      setState({ aiLogs: updatedLogs, isAiLoading: false });
      pushHistory(`AI: ${prompt}`, currentObjs);
    } catch (err: any) {
      console.error('AI command failure:', err);
      setState({
        isAiLoading: false,
        aiError: err.message || 'Failed to process AI design request.',
      });
    }
  },

  revertAiLog(logId: string) {
    const log = currentState.aiLogs.find((l) => l.id === logId);
    if (!log) return;
    pushHistory(`Reverted AI command: "${log.prompt}"`, log.snapshotState);
  },

  toggleTagVisibility(tagId: ObjectTag) {
    setState((prev) => {
      const updatedTags = prev.tags.map((t) => (t.id === tagId ? { ...t, visible: !t.visible } : t));
      const targetTag = updatedTags.find((t) => t.id === tagId);
      const isVisible = targetTag?.visible ?? true;
      const updatedObjs = prev.objects.map((o) => (o.tag === tagId ? { ...o, visible: isVisible } : o));
      return { tags: updatedTags, objects: updatedObjs };
    });
  },

  toggleTagLock(tagId: ObjectTag) {
    setState((prev) => {
      const updatedTags = prev.tags.map((t) => (t.id === tagId ? { ...t, locked: !t.locked } : t));
      const targetTag = updatedTags.find((t) => t.id === tagId);
      const isLocked = targetTag?.locked ?? false;
      const updatedObjs = prev.objects.map((o) => (o.tag === tagId ? { ...o, locked: isLocked } : o));
      return { tags: updatedTags, objects: updatedObjs };
    });
  },

  saveCameraScene(name: string, cameraPos: Vector3D, targetPos: Vector3D, zoom = 1) {
    const newScene: SavedScene = {
      id: `scene-${Date.now()}`,
      name,
      cameraPosition: { ...cameraPos },
      targetPosition: { ...targetPos },
      zoom,
    };
    setState((prev) => ({
      savedScenes: [...prev.savedScenes, newScene],
      activeSceneId: newScene.id,
    }));
  },

  resetScene() {
    pushHistory('Reset to empty workspace', []);
    setState({ selectedObjectIds: [], selectedFaceId: null });
  },

  /**
   * Multi-Page / Sheets Management
   */
  createPage(
    title: string,
    type: '3d-space' | '2d-layout' = '3d-space',
    template: 'blank' | 'copy' | 'studio' | 'kitchen' = 'blank'
  ) {
    // First synchronize current objects into active page
    const updatedPages = currentState.pages.map((p) =>
      p.id === currentState.activePageId ? { ...p, objects: [...currentState.objects] } : p
    );

    let initialObjs: ModelObject[] = [];
    if (type === '2d-layout' || template === 'copy') {
      initialObjs = JSON.parse(JSON.stringify(currentState.objects));
    } else if (template === 'studio') {
      initialObjs = JSON.parse(JSON.stringify(INITIAL_OBJECTS));
    } else if (template === 'kitchen') {
      const ts = Date.now();
      initialObjs = [
        {
          id: `floor-${ts}`,
          name: 'Kitchen Floor Slab',
          type: 'box',
          tag: 'structure',
          position: { x: 0, y: -50, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 4500, height: 100, depth: 3500 },
          materialId: 'tiles-carrara-marble',
          color: '#f0f2f5',
          visible: true,
          locked: false,
        },
        {
          id: `wall-k1-${ts}`,
          name: 'Kitchen Back Wall',
          type: 'wall',
          tag: 'walls',
          position: { x: 0, y: 0, z: -1750 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 4500, height: 2600, depth: 150 },
          materialId: 'paint-pure-white',
          visible: true,
          locked: false,
        },
        {
          id: `island-${ts}`,
          name: 'Kitchen Island Unit',
          type: 'component',
          tag: 'kitchen',
          position: { x: 0, y: 0, z: 200 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 2200, height: 900, depth: 950 },
          materialId: 'tiles-carrara-marble',
          visible: true,
          locked: false,
          architecturalProps: { componentType: 'kitchenIsland' },
        },
        {
          id: `counter-${ts}`,
          name: 'Sink Countertop',
          type: 'component',
          tag: 'kitchen',
          position: { x: -800, y: 0, z: -1400 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 1800, height: 880, depth: 600 },
          materialId: 'tiles-carrara-marble',
          visible: true,
          locked: false,
          architecturalProps: { componentType: 'kitchenCounterSink' },
        },
        {
          id: `fridge-${ts}`,
          name: 'French Door Refrigerator',
          type: 'component',
          tag: 'kitchen',
          position: { x: 1400, y: 0, z: -1350 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 900, height: 1800, depth: 700 },
          materialId: 'metal-brushed-steel',
          visible: true,
          locked: false,
          architecturalProps: { componentType: 'refrigerator' },
        },
      ];
    }

    const newPage: DesignPage = {
      id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title || (type === '2d-layout' ? '2D LayOut Sheet' : 'New Design Space'),
      type,
      objects: initialObjs,
      savedScenes: [],
      scale: type === '2d-layout' ? '1:50' : undefined,
      createdAt: new Date().toISOString(),
    };

    setState({
      pages: [...updatedPages, newPage],
      activePageId: newPage.id,
      objects: initialObjs,
      selectedObjectIds: [],
      selectedFaceId: null,
    });
    pushHistory(`Created page: ${newPage.title}`, initialObjs);
  },

  switchPage(pageId: string) {
    if (pageId === currentState.activePageId) return;

    // Save current objects to active page
    const updatedPages = currentState.pages.map((p) =>
      p.id === currentState.activePageId ? { ...p, objects: [...currentState.objects] } : p
    );

    const targetPage = updatedPages.find((p) => p.id === pageId);
    if (!targetPage) return;

    setState({
      pages: updatedPages,
      activePageId: pageId,
      objects: JSON.parse(JSON.stringify(targetPage.objects)),
      selectedObjectIds: [],
      selectedFaceId: null,
    });
  },

  renamePage(pageId: string, newTitle: string) {
    if (!newTitle.trim()) return;
    setState((prev) => ({
      pages: prev.pages.map((p) => (p.id === pageId ? { ...p, title: newTitle.trim() } : p)),
    }));
  },

  deletePage(pageId: string) {
    if (currentState.pages.length <= 1) return; // Must keep at least 1 page
    const remaining = currentState.pages.filter((p) => p.id !== pageId);
    const nextActiveId =
      currentState.activePageId === pageId ? remaining[0].id : currentState.activePageId;
    const targetPage = remaining.find((p) => p.id === nextActiveId) || remaining[0];

    setState({
      pages: remaining,
      activePageId: targetPage.id,
      objects: JSON.parse(JSON.stringify(targetPage.objects)),
      selectedObjectIds: [],
      selectedFaceId: null,
    });
  },

  duplicatePage(pageId: string) {
    const pageToDup = currentState.pages.find((p) => p.id === pageId);
    if (!pageToDup) return;

    const copy: DesignPage = {
      ...pageToDup,
      id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${pageToDup.title} (Copy)`,
      objects: JSON.parse(JSON.stringify(pageToDup.objects)),
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      pages: [...prev.pages, copy],
      activePageId: copy.id,
      objects: JSON.parse(JSON.stringify(copy.objects)),
      selectedObjectIds: [],
      selectedFaceId: null,
    }));
  },

  loadProject(jsonData: any) {
    try {
      if (jsonData && Array.isArray(jsonData.objects)) {
        setState({
          project: jsonData.project || currentState.project,
          objects: jsonData.objects,
          savedScenes: jsonData.savedScenes || currentState.savedScenes,
          tags: jsonData.tags || DEFAULT_TAGS,
          selectedObjectIds: [],
          selectedFaceId: null,
        });
        pushHistory('Imported project', jsonData.objects);
      }
    } catch (e) {
      console.error('Failed to parse project JSON:', e);
    }
  },

  // Interactive Beginner Tutorial ("Build Your First Room")
  startInteractiveTutorial() {
    setState({
      isInteractiveTutorialActive: true,
      tutorialCurrentStep: 1,
      isInstructionsOpen: false,
      isHelpOpen: false,
      isTourOpen: false,
      isTourWelcomeOpen: false,
      isMobileDrawerOpen: false,
      dismissEmptyWorkspacePrompt: true,
    });
  },

  // Interactive Guided Interface Tour
  startGuidedTour() {
    setState({
      isTourOpen: true,
      tourStep: 1,
      isTourWelcomeOpen: false,
      isInstructionsOpen: false,
      isHelpOpen: false,
      isInteractiveTutorialActive: false,
      isMobileDrawerOpen: false,
      dismissEmptyWorkspacePrompt: true,
    });
  },

  nextTourStep() {
    setState((prev) => ({
      tourStep: Math.min(18, prev.tourStep + 1),
    }));
  },

  prevTourStep() {
    setState((prev) => ({
      tourStep: Math.max(1, prev.tourStep - 1),
    }));
  },

  setTourStep(step: number) {
    setState({ tourStep: Math.max(1, Math.min(18, step)) });
  },

  exitGuidedTour() {
    setState({ isTourOpen: false, isTourWelcomeOpen: false });
  },

  openHelpSection(sectionId: string) {
    setState({
      isHelpOpen: true,
      isInstructionsOpen: true,
      initialHelpSection: sectionId,
      isTourOpen: false,
      isTourWelcomeOpen: false,
      isInteractiveTutorialActive: false,
      isMobileDrawerOpen: false,
    });
  },

  nextTutorialStep() {
    setState((prev) => ({
      tutorialCurrentStep: Math.min(13, prev.tutorialCurrentStep + 1),
    }));
  },

  prevTutorialStep() {
    setState((prev) => ({
      tutorialCurrentStep: Math.max(1, prev.tutorialCurrentStep - 1),
    }));
  },

  setTutorialStep(step: number) {
    setState({ tutorialCurrentStep: Math.max(1, Math.min(13, step)) });
  },

  exitInteractiveTutorial() {
    setState({ isInteractiveTutorialActive: false });
  },

  setAiInputPrefill(promptText: string) {
    setState({
      aiInputPrefill: promptText,
      activeTab: 'ai',
      isMobileDrawerOpen: true,
      isInstructionsOpen: false,
    });
  },

  executeTutorialStepAuto(step: number) {
    const ts = Date.now();
    switch (step) {
      case 1: // New Project
        modelActions.resetScene();
        break;
      case 2: // 4m x 5m Room
      case 3: // 2.4m High Walls
        modelActions.createRoom(4000, 5000, 2400, 100, 0, 0);
        break;
      case 4: { // Add Door
        const doorObj: ModelObject = {
          id: `door-${ts}`,
          name: 'Interior Door (900mm)',
          type: 'door',
          tag: 'doors',
          position: { x: -2000, y: 0, z: 0 },
          rotation: { x: 0, y: Math.PI / 2, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 900, height: 2100, depth: 100 },
          materialId: 'wood-walnut',
          color: '#5c4033',
          visible: true,
          locked: false,
          architecturalProps: { componentType: 'door', wallThickness: 100 },
        };
        modelActions.addObject(doorObj, 'Tutorial: Added 900mm Door');
        break;
      }
      case 5: { // Add Two Windows
        const win1: ModelObject = {
          id: `win1-${ts}`,
          name: 'Left Window (1400mm)',
          type: 'window',
          tag: 'windows',
          position: { x: -1000, y: 900, z: -2500 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 1400, height: 1200, depth: 100 },
          materialId: 'glass-architectural',
          color: '#93c5fd',
          visible: true,
          locked: false,
          architecturalProps: { componentType: 'window', wallThickness: 100 },
        };
        const win2: ModelObject = {
          id: `win2-${ts}`,
          name: 'Right Window (1400mm)',
          type: 'window',
          tag: 'windows',
          position: { x: 1000, y: 900, z: -2500 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 1400, height: 1200, depth: 100 },
          materialId: 'glass-architectural',
          color: '#93c5fd',
          visible: true,
          locked: false,
          architecturalProps: { componentType: 'window', wallThickness: 100 },
        };
        modelActions.addObject(win1, 'Tutorial: Added Window 1');
        modelActions.addObject(win2, 'Tutorial: Added Window 2');
        break;
      }
      case 6: { // Flooring
        const floorObj = currentState.objects.find((o) => o.tag === 'structure');
        if (floorObj) {
          modelActions.updateObject(floorObj.id, {
            materialId: 'floor-oak-parquet',
            color: '#bfa079',
          }, 'Tutorial: Applied Parquet Flooring');
        }
        break;
      }
      case 7: { // Sofa
        const sofa: ModelObject = {
          id: `sofa-${ts}`,
          name: '3-Seater Sofa',
          type: 'component',
          tag: 'furniture',
          position: { x: 0, y: 0, z: 1200 },
          rotation: { x: 0, y: Math.PI, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 2200, height: 780, depth: 920 },
          materialId: 'fabric-charcoal-weave',
          color: '#334155',
          visible: true,
          locked: false,
          architecturalProps: { componentType: 'sofa3Seat' },
        };
        modelActions.addObject(sofa, 'Tutorial: Added 3-Seater Sofa');
        break;
      }
      case 8: { // Coffee Table
        const table: ModelObject = {
          id: `table-${ts}`,
          name: 'Timber Coffee Table',
          type: 'component',
          tag: 'furniture',
          position: { x: 0, y: 0, z: 200 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: 1200, height: 420, depth: 650 },
          materialId: 'wood-natural-oak',
          color: '#c49a6c',
          visible: true,
          locked: false,
          architecturalProps: { componentType: 'coffeeTable' },
        };
        modelActions.addObject(table, 'Tutorial: Added Coffee Table');
        break;
      }
      case 9: { // Move Furniture
        const tableObj = currentState.objects.find((o) => o.name.includes('Coffee Table'));
        if (tableObj) {
          modelActions.updateObject(tableObj.id, {
            position: { ...tableObj.position, z: 350 },
          }, 'Tutorial: Moved Coffee Table');
        }
        break;
      }
      case 10: { // Change Material
        const sofaObj = currentState.objects.find((o) => o.name.includes('Sofa'));
        if (sofaObj) {
          modelActions.updateObject(sofaObj.id, {
            materialId: 'fabric-natural-linen',
            color: '#e2d9cc',
          }, 'Tutorial: Changed Sofa Material');
        }
        break;
      }
      case 11: // Camera
        window.dispatchEvent(new CustomEvent('structura_camera_action', { detail: { view: 'iso' } }));
        break;
      case 12: // Save
        try {
          localStorage.setItem(
            'structura_3d_project',
            JSON.stringify({
              project: currentState.project,
              objects: currentState.objects,
              savedScenes: currentState.savedScenes,
              tags: currentState.tags,
            })
          );
          setState({ saveStatus: 'saved' });
        } catch (e) {
          console.error(e);
        }
        break;
      case 13: // Export
        window.dispatchEvent(new CustomEvent('structura_camera_action', { detail: { action: 'fit' } }));
        break;
    }
  },
};

export interface UseModelStoreHook {
  (): ModelState;
  getState: () => ModelState;
  setState: (updater: Partial<ModelState> | ((prev: ModelState) => Partial<ModelState>)) => void;
}

export const useModelStore: UseModelStoreHook = Object.assign(
  function (): ModelState {
    return useSyncExternalStore(
      (onStoreChange) => {
        listeners.add(onStoreChange);
        return () => listeners.delete(onStoreChange);
      },
      getState,
      getState
    );
  },
  {
    getState,
    setState,
  }
);

// Helpers for procedural library item dimensions
function getDefaultDimensionsForType(type: string): { w: number; h: number; d: number; material: string } {
  switch (type) {
    case 'queenBed':
      return { w: 1600, h: 950, d: 2100, material: 'wood-natural-oak' };
    case 'singleBed':
      return { w: 1000, h: 900, d: 2000, material: 'wood-natural-oak' };
    case 'diningTable':
      return { w: 1800, h: 760, d: 900, material: 'wood-natural-oak' };
    case 'diningChair':
      return { w: 480, h: 840, d: 520, material: 'fabric-charcoal-weave' };
    case 'coffeeTable':
      return { w: 1200, h: 420, d: 650, material: 'wood-natural-oak' };
    case 'officeDesk':
      return { w: 1500, h: 750, d: 750, material: 'tiles-carrara-marble' };
    case 'officeChair':
      return { w: 600, h: 960, d: 600, material: 'fabric-charcoal-weave' };
    case 'armchair':
      return { w: 850, h: 820, d: 850, material: 'fabric-natural-linen' };
    case 'sofa3Seat':
      return { w: 2200, h: 780, d: 920, material: 'fabric-charcoal-weave' };
    case 'sofaSectional':
      return { w: 2800, h: 780, d: 1800, material: 'fabric-charcoal-weave' };
    case 'kitchenBaseCabinet':
      return { w: 600, h: 880, d: 600, material: 'paint-pure-white' };
    case 'kitchenUpperCabinet':
      return { w: 600, h: 720, d: 350, material: 'paint-pure-white' };
    case 'kitchenIsland':
      return { w: 2000, h: 900, d: 900, material: 'tiles-carrara-marble' };
    case 'kitchenCounterSink':
      return { w: 1200, h: 880, d: 600, material: 'tiles-carrara-marble' };
    case 'refrigerator':
      return { w: 900, h: 1800, d: 700, material: 'metal-brushed-steel' };
    case 'wardrobe':
      return { w: 1500, h: 2100, d: 600, material: 'wood-walnut' };
    case 'bookshelf':
      return { w: 1000, h: 1800, d: 350, material: 'wood-natural-oak' };
    case 'bathroomVanity':
      return { w: 1000, h: 850, d: 500, material: 'wood-walnut' };
    case 'toilet':
      return { w: 400, h: 800, d: 700, material: 'paint-pure-white' };
    case 'bathtub':
      return { w: 1700, h: 580, d: 800, material: 'paint-pure-white' };
    default:
      return { w: 1000, h: 800, d: 800, material: 'wood-natural-oak' };
  }
}

function getTagForType(type: string): ObjectTag {
  if (type.includes('kitchen') || type === 'refrigerator' || type === 'cooktopStove') return 'kitchen';
  if (type.includes('bathroom') || type === 'toilet' || type === 'bathtub' || type === 'showerStall')
    return 'bathroom';
  if (type === 'door') return 'doors';
  if (type === 'window') return 'windows';
  if (type === 'wall') return 'walls';
  return 'furniture';
}

function formatComponentName(type: string): string {
  return type
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
