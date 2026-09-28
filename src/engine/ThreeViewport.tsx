import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Orbit, Pencil } from 'lucide-react';
import { useModelStore, modelActions } from '../state/useModelStore';
import { ModelObject, SnapResult, Vector3D } from '../types/model';
import { calculateSnapPoint } from './snapping';
import { buildProceduralMesh } from './proceduralObjects';
import { createThreeMaterial, PRESET_MATERIALS } from './materials';
import { formatMeasurement } from '../utils/units';

export const ThreeViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    objects,
    selectedObjectIds,
    activeTool,
    activeUnit,
    mobileTouchMode,
    activeMaterialId,
    activeColor,
    activeWallHeight,
    activeWallThickness,
    activeRoomWidth,
    activeRoomLength,
    activeCircleSides,
    activePolygonSides,
    enableGridSnap,
    enableGeometrySnap,
    enableAxisSnap,
    gridStepMm,
    theme,
    presentationMode,
    savedScenes,
    activeSceneId,
  } = useModelStore();

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const previewGroupRef = useRef<THREE.Group | null>(null);
  const helpersGroupRef = useRef<THREE.Group | null>(null);

  // Interaction State
  const [snapInfo, setSnapInfo] = useState<SnapResult | null>(null);
  const [cursorPosScreen, setCursorPosScreen] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPointerOverCanvas, setIsPointerOverCanvas] = useState(false);

  // Drawing state refs
  const isDrawingRef = useRef(false);
  const drawStartPointRef = useRef<Vector3D | null>(null);
  const currentDrawPointsRef = useRef<Vector3D[]>([]);
  const pushPullTargetRef = useRef<{ objectId: string; faceId?: string; startY: number } | null>(null);
  const moveStartRef = useRef<{ objectId: string; startPos: Vector3D; mouseStart: Vector3D } | null>(null);
  const rotateStartRef = useRef<{ objectId: string; startRotY: number; mouseStartAngle: number } | null>(null);

  // Camera navigation state
  const isNavigatingRef = useRef(false);
  const navModeRef = useRef<'orbit' | 'pan' | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 500, 0));
  const sphericalRef = useRef<THREE.Spherical>(new THREE.Spherical(7000, Math.PI / 3, Math.PI / 4));

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const isDark = theme === 'dark';
    scene.background = new THREE.Color(isDark ? '#0f172a' : '#f8fafc');

    const camera = new THREE.PerspectiveCamera(45, width / height, 50, 200000);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.7 : 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, isDark ? 0x1e293b : 0x94a3b8, 0.4);
    hemiLight.position.set(0, 5000, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.2);
    sunLight.position.set(6000, 10000, 7000);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1000;
    sunLight.shadow.camera.far = 30000;
    const d = 8000;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Groups
    const objectsGroup = new THREE.Group();
    objectsGroup.name = 'objects-group';
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    const previewGroup = new THREE.Group();
    previewGroup.name = 'preview-group';
    scene.add(previewGroup);
    previewGroupRef.current = previewGroup;

    const helpersGroup = new THREE.Group();
    helpersGroup.name = 'helpers-group';
    scene.add(helpersGroup);
    helpersGroupRef.current = helpersGroup;

    // Grid Floor
    setupGridAndAxes(helpersGroup, isDark);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update theme colors
  useEffect(() => {
    if (!sceneRef.current || !helpersGroupRef.current) return;
    const isDark = theme === 'dark';
    sceneRef.current.background = new THREE.Color(isDark ? '#090d16' : '#f8fafc');
    setupGridAndAxes(helpersGroupRef.current, isDark);
  }, [theme]);

  // Update 3D Scene Objects
  useEffect(() => {
    if (!objectsGroupRef.current) return;
    const group = objectsGroupRef.current;

    // Clear old meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
    }

    // Build procedural 3D meshes for each object
    for (const obj of objects) {
      if (!obj.visible) continue;
      const meshGroup = buildProceduralMesh(obj);
      meshGroup.position.set(obj.position.x, obj.position.y, obj.position.z);
      meshGroup.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);
      meshGroup.scale.set(obj.scale.x, obj.scale.y, obj.scale.z);

      // Add selection highlight outline if selected
      if (selectedObjectIds.includes(obj.id)) {
        addSelectionHighlight(meshGroup);
      }

      group.add(meshGroup);
    }
  }, [objects, selectedObjectIds]);

  function updateCameraPosition() {
    if (!cameraRef.current) return;
    const pos = new THREE.Vector3().setFromSpherical(sphericalRef.current).add(cameraTargetRef.current);
    cameraRef.current.position.copy(pos);
    cameraRef.current.lookAt(cameraTargetRef.current);
  }

  function setupGridAndAxes(group: THREE.Group, isDark: boolean) {
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // Main Grid (20m x 20m with 1m divisions and 500mm sub-divisions)
    const gridSize = 30000;
    const gridDivisions = 30;
    const gridHelper = new THREE.GridHelper(
      gridSize,
      gridDivisions,
      isDark ? 0x475569 : 0x94a3b8,
      isDark ? 0x1e293b : 0xe2e8f0
    );
    gridHelper.position.y = -1;
    group.add(gridHelper);

    // SketchUp-style World Reference Axes (+X Red, +Z Green/horizontal, +Y Blue/vertical)
    const axisLen = 15000;

    // Red Axis (X)
    const xGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-axisLen, 0, 0),
      new THREE.Vector3(axisLen, 0, 0),
    ]);
    const xMat = new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 });
    const xAxis = new THREE.Line(xGeom, xMat);
    group.add(xAxis);

    // Green Axis (Z - horizontal depth)
    const zGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -axisLen),
      new THREE.Vector3(0, 0, axisLen),
    ]);
    const zMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    const zAxis = new THREE.Line(zGeom, zMat);
    group.add(zAxis);

    // Blue Axis (Y - vertical height)
    const yGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, axisLen, 0),
    ]);
    const yMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, linewidth: 2 });
    const yAxis = new THREE.Line(yGeom, yMat);
    group.add(yAxis);
  }

  function addSelectionHighlight(object3D: THREE.Object3D) {
    const box = new THREE.Box3().setFromObject(object3D);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Subtract parent position to keep relative
    center.sub(object3D.position);

    const boxGeom = new THREE.BoxGeometry(size.x + 20, size.y + 20, size.z + 20);
    const edgesGeom = new THREE.EdgesGeometry(boxGeom);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8, // Vibrant Sky Blue
      linewidth: 3,
    });
    const wireframe = new THREE.LineSegments(edgesGeom, lineMat);
    wireframe.position.copy(center);
    wireframe.name = 'selection-outline';
    object3D.add(wireframe);
  }

  // Raycasting and Snapping helper
  const getRaycastPoint = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): SnapResult => {
      if (!canvasRef.current || !cameraRef.current) {
        return { point: { x: 0, y: 0, z: 0 }, type: 'none', label: '', color: '' };
      }
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

      return calculateSnapPoint({
        pointerScreen: { x: e.clientX, y: e.clientY },
        raycaster,
        camera: cameraRef.current,
        groundPlane,
        sceneObjects: objects,
        referencePoint: drawStartPointRef.current,
        activeGridStepMm: gridStepMm,
        enableGridSnap,
        enableGeometrySnap,
        enableAxisSnap,
      });
    },
    [objects, gridStepMm, enableGridSnap, enableGeometrySnap, enableAxisSnap]
  );

  // Pointer Movement Handler
  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setCursorPosScreen({ x: e.clientX, y: e.clientY });

    // Camera Navigation Drag
    if (isNavigatingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      if (navModeRef.current === 'orbit') {
        sphericalRef.current.theta -= dx * 0.007;
        sphericalRef.current.phi -= dy * 0.007;
        // Clamp phi so camera doesn't flip
        sphericalRef.current.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.02, sphericalRef.current.phi));
        updateCameraPosition();
      } else if (navModeRef.current === 'pan') {
        if (!cameraRef.current) return;
        const panSpeed = (sphericalRef.current.radius / 1500) * 1.5;
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRef.current.quaternion);
        const up = new THREE.Vector3(0, 1, 0);

        cameraTargetRef.current.addScaledVector(right, -dx * panSpeed);
        cameraTargetRef.current.addScaledVector(up, dy * panSpeed);
        updateCameraPosition();
      }
      return;
    }

    // Snapping Calculation
    const snap = getRaycastPoint(e);
    setSnapInfo(snap);

    // Live Drawing Previews
    if (isDrawingRef.current && drawStartPointRef.current && previewGroupRef.current) {
      updateLiveDrawingPreview(drawStartPointRef.current, snap.point);
    }

    // Push/Pull Dragging
    if (activeTool === 'pushpull' && pushPullTargetRef.current) {
      const deltaY = (pushPullTargetRef.current.startY - e.clientY) * 12;
      modelActions.setVcbValue(`${Math.round(deltaY)}`);
    }

    // Move Dragging
    if (activeTool === 'move' && moveStartRef.current) {
      const dX = snap.point.x - moveStartRef.current.mouseStart.x;
      const dZ = snap.point.z - moveStartRef.current.mouseStart.z;
      const target = objects.find((o) => o.id === moveStartRef.current!.objectId);
      if (target) {
        modelActions.setVcbValue(`${Math.round(dX)}, ${Math.round(dZ)}`);
      }
    }
  };

  // Live drawing preview renderer
  function updateLiveDrawingPreview(p1: Vector3D, p2: Vector3D) {
    if (!previewGroupRef.current) return;
    const group = previewGroupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const length = Math.hypot(dx, dz);

    if (activeTool === 'line' || activeTool === 'wall' || activeTool === 'measure') {
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(p1.x, p1.y + 2, p1.z),
        new THREE.Vector3(p2.x, p2.y + 2, p2.z),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: activeTool === 'wall' ? 0xf59e0b : 0x38bdf8,
        linewidth: 3,
      });
      group.add(new THREE.Line(lineGeom, lineMat));

      if (activeTool === 'wall') {
        // Wall thickness box preview
        const wallPreview = new THREE.Mesh(
          new THREE.BoxGeometry(length, activeWallHeight, activeWallThickness),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b, opacity: 0.4, transparent: true })
        );
        const midX = (p1.x + p2.x) / 2;
        const midZ = (p1.z + p2.z) / 2;
        const angle = Math.atan2(dz, dx);
        wallPreview.position.set(midX, activeWallHeight / 2, midZ);
        wallPreview.rotation.y = -angle;
        group.add(wallPreview);
      }

      modelActions.setVcbValue(formatMeasurement(length, activeUnit));
    } else if (activeTool === 'rectangle' || activeTool === 'room') {
      // 4-corner rectangle preview
      const minX = Math.min(p1.x, p2.x);
      const maxX = Math.max(p1.x, p2.x);
      const minZ = Math.min(p1.z, p2.z);
      const maxZ = Math.max(p1.z, p2.z);
      const w = maxX - minX;
      const d = maxZ - minZ;

      const rectGeom = new THREE.PlaneGeometry(w, d);
      const rectMat = new THREE.MeshBasicMaterial({
        color: activeTool === 'room' ? 0x10b981 : 0x38bdf8,
        opacity: 0.35,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const rectMesh = new THREE.Mesh(rectGeom, rectMat);
      rectMesh.rotation.x = -Math.PI / 2;
      rectMesh.position.set((minX + maxX) / 2, 2, (minZ + maxZ) / 2);
      group.add(rectMesh);

      // Border outline
      const outlineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(minX, 3, minZ),
        new THREE.Vector3(maxX, 3, minZ),
        new THREE.Vector3(maxX, 3, maxZ),
        new THREE.Vector3(minX, 3, maxZ),
        new THREE.Vector3(minX, 3, minZ),
      ]);
      const outline = new THREE.Line(
        outlineGeom,
        new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 2 })
      );
      group.add(outline);

      modelActions.setVcbValue(
        `${formatMeasurement(w, activeUnit)}, ${formatMeasurement(d, activeUnit)}`
      );
    } else if (activeTool === 'circle' || activeTool === 'polygon') {
      const radius = Math.hypot(dx, dz);
      const sides = activeTool === 'circle' ? activeCircleSides : activePolygonSides;
      const circleGeom = new THREE.CircleGeometry(radius, sides);
      const circleMat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        opacity: 0.35,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const circleMesh = new THREE.Mesh(circleGeom, circleMat);
      circleMesh.rotation.x = -Math.PI / 2;
      circleMesh.position.set(p1.x, 2, p1.z);
      group.add(circleMesh);

      modelActions.setVcbValue(formatMeasurement(radius, activeUnit));
    }
  }

  // Pointer Down (Click / Drag Start)
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Navigation Triggers: Middle click OR Alt+Left Click OR active tool 'orbit'/'pan'
    if (e.button === 1 || (e.button === 0 && e.altKey) || (e.button === 0 && (activeTool === 'orbit' || activeTool === 'pan'))) {
      isNavigatingRef.current = true;
      navModeRef.current = e.shiftKey || activeTool === 'pan' ? 'pan' : 'orbit';
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button !== 0) return; // Left click only for modelling

    const snap = getRaycastPoint(e);

    // Selection Tool
    if (activeTool === 'select') {
      if (snap.targetId) {
        modelActions.selectObject(snap.targetId, e.shiftKey);
      } else {
        modelActions.deselectAll();
      }
      return;
    }

    // Paint Tool
    if (activeTool === 'paint') {
      if (snap.targetId) {
        modelActions.updateObject(
          snap.targetId,
          { materialId: activeMaterialId, color: activeColor },
          'Applied material'
        );
      }
      return;
    }

    // Erase Tool
    if (activeTool === 'erase') {
      if (snap.targetId) {
        modelActions.updateObject(snap.targetId, {}, 'Deleted object');
        modelActions.selectObject(snap.targetId);
        modelActions.deleteSelected();
      }
      return;
    }

    // Push/Pull Extrusion Tool
    if (activeTool === 'pushpull') {
      if (snap.targetId) {
        pushPullTargetRef.current = {
          objectId: snap.targetId,
          startY: e.clientY,
        };
      }
      return;
    }

    // Move Tool Start
    if (activeTool === 'move') {
      if (selectedObjectIds.length > 0) {
        const obj = objects.find((o) => o.id === selectedObjectIds[0]);
        if (obj) {
          moveStartRef.current = {
            objectId: obj.id,
            startPos: { ...obj.position },
            mouseStart: { ...snap.point },
          };
        }
      }
      return;
    }

    // Rotate Tool
    if (activeTool === 'rotate') {
      if (selectedObjectIds.length > 0) {
        const obj = objects.find((o) => o.id === selectedObjectIds[0]);
        if (obj) {
          const angle = Math.atan2(snap.point.z - obj.position.z, snap.point.x - obj.position.x);
          rotateStartRef.current = {
            objectId: obj.id,
            startRotY: obj.rotation.y,
            mouseStartAngle: angle,
          };
        }
      }
      return;
    }

    // Drawing Tools: Line, Rectangle, Circle, Polygon, Wall, Room, Measure
    if (!isDrawingRef.current) {
      // First click: Lock start point
      isDrawingRef.current = true;
      drawStartPointRef.current = snap.point;
      currentDrawPointsRef.current = [snap.point];
    } else {
      // Second click: Finalize geometry!
      finalizeGeometry(drawStartPointRef.current!, snap.point);
      isDrawingRef.current = false;
      drawStartPointRef.current = null;
      if (previewGroupRef.current) {
        while (previewGroupRef.current.children.length > 0) {
          previewGroupRef.current.remove(previewGroupRef.current.children[0]);
        }
      }
    }
  };

  // Finalize Drawing Operation
  function finalizeGeometry(p1: Vector3D, p2: Vector3D) {
    const timestamp = Date.now();
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const length = Math.hypot(dx, dz);

    if (length < 20) return; // Prevent zero-size creation

    switch (activeTool) {
      case 'rectangle': {
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minZ = Math.min(p1.z, p2.z);
        const maxZ = Math.max(p1.z, p2.z);
        const w = maxX - minX;
        const d = maxZ - minZ;

        const newFace: ModelObject = {
          id: `rect-face-${timestamp}`,
          name: `Drawn Face (${Math.round(w)}x${Math.round(d)})`,
          type: 'face',
          tag: 'shapes',
          position: { x: (minX + maxX) / 2, y: 0, z: (minZ + maxZ) / 2 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: w, height: 10, depth: d },
          materialId: activeMaterialId,
          color: activeColor,
          visible: true,
          locked: false,
          faces: [
            {
              id: `face-${timestamp}`,
              points: [
                { x: -w / 2, y: 0, z: -d / 2 },
                { x: w / 2, y: 0, z: -d / 2 },
                { x: w / 2, y: 0, z: d / 2 },
                { x: -w / 2, y: 0, z: d / 2 },
              ],
              normal: { x: 0, y: 1, z: 0 },
              area: w * d,
            },
          ],
        };
        modelActions.addObject(newFace, 'Drawn Rectangle Face');
        modelActions.selectObject(newFace.id);
        break;
      }

      case 'line': {
        // Continuous line drawing or closed polygon detection
        const lineObj: ModelObject = {
          id: `line-${timestamp}`,
          name: `Line Segment (${Math.round(length)}mm)`,
          type: 'box',
          tag: 'shapes',
          position: { x: (p1.x + p2.x) / 2, y: 0, z: (p1.z + p2.z) / 2 },
          rotation: { x: 0, y: -Math.atan2(dz, dx), z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: { width: length, height: 10, depth: 10 },
          materialId: 'metal-matte-black',
          visible: true,
          locked: false,
        };
        modelActions.addObject(lineObj, 'Drawn Line');
        break;
      }

      case 'circle': {
        const radius = Math.hypot(dx, dz);
        const circleObj: ModelObject = {
          id: `circle-${timestamp}`,
          name: `Circle Face (r=${Math.round(radius)})`,
          type: 'cylinder',
          tag: 'shapes',
          position: { x: p1.x, y: 0, z: p1.z },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: {
            width: radius * 2,
            height: 10,
            depth: radius * 2,
            radius,
            sides: activeCircleSides,
          },
          materialId: activeMaterialId,
          visible: true,
          locked: false,
        };
        modelActions.addObject(circleObj, 'Drawn Circle');
        modelActions.selectObject(circleObj.id);
        break;
      }

      case 'polygon': {
        const radius = Math.hypot(dx, dz);
        const polyObj: ModelObject = {
          id: `poly-${timestamp}`,
          name: `Polygon (${activePolygonSides} sides)`,
          type: 'cylinder',
          tag: 'shapes',
          position: { x: p1.x, y: 0, z: p1.z },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: {
            width: radius * 2,
            height: 10,
            depth: radius * 2,
            radius,
            sides: activePolygonSides,
          },
          materialId: activeMaterialId,
          visible: true,
          locked: false,
        };
        modelActions.addObject(polyObj, 'Drawn Polygon');
        modelActions.selectObject(polyObj.id);
        break;
      }

      case 'wall': {
        const angle = Math.atan2(dz, dx);
        const wallObj: ModelObject = {
          id: `wall-${timestamp}`,
          name: `Wall Segment (${Math.round(length)}mm)`,
          type: 'wall',
          tag: 'walls',
          position: { x: (p1.x + p2.x) / 2, y: 0, z: (p1.z + p2.z) / 2 },
          rotation: { x: 0, y: -angle, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          dimensions: {
            width: length,
            height: activeWallHeight,
            depth: activeWallThickness,
          },
          materialId: activeMaterialId || 'paint-warm-white',
          visible: true,
          locked: false,
        };
        modelActions.addObject(wallObj, 'Drawn Wall');
        break;
      }

      case 'room': {
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minZ = Math.min(p1.z, p2.z);
        const maxZ = Math.max(p1.z, p2.z);
        const w = maxX - minX;
        const l = maxZ - minZ;
        modelActions.createRoom(
          w,
          l,
          activeWallHeight,
          activeWallThickness,
          (minX + maxX) / 2,
          (minZ + maxZ) / 2
        );
        break;
      }
    }
  }

  // Pointer Up
  const handlePointerUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isNavigatingRef.current = false;
    navModeRef.current = null;

    // Push/Pull commit
    if (activeTool === 'pushpull' && pushPullTargetRef.current) {
      const deltaY = (pushPullTargetRef.current.startY - e.clientY) * 12;
      if (Math.abs(deltaY) > 50) {
        modelActions.pushPull(pushPullTargetRef.current.objectId, deltaY);
      }
      pushPullTargetRef.current = null;
    }

    // Move commit
    if (activeTool === 'move' && moveStartRef.current) {
      const snap = getRaycastPoint(e);
      const dX = snap.point.x - moveStartRef.current.mouseStart.x;
      const dZ = snap.point.z - moveStartRef.current.mouseStart.z;
      if (Math.hypot(dX, dZ) > 10) {
        modelActions.updateObject(
          moveStartRef.current.objectId,
          {
            position: {
              x: moveStartRef.current.startPos.x + dX,
              y: moveStartRef.current.startPos.y,
              z: moveStartRef.current.startPos.z + dZ,
            },
          },
          'Moved object'
        );
      }
      moveStartRef.current = null;
    }

    // Rotate commit
    if (activeTool === 'rotate' && rotateStartRef.current) {
      const snap = getRaycastPoint(e);
      const obj = objects.find((o) => o.id === rotateStartRef.current!.objectId);
      if (obj) {
        const curAngle = Math.atan2(snap.point.z - obj.position.z, snap.point.x - obj.position.x);
        const dAngle = curAngle - rotateStartRef.current.mouseStartAngle;
        modelActions.updateObject(
          obj.id,
          {
            rotation: {
              ...obj.rotation,
              y: rotateStartRef.current.startRotY - dAngle,
            },
          },
          'Rotated object'
        );
      }
      rotateStartRef.current = null;
    }
  };

  // Zoom with Wheel
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    sphericalRef.current.radius = Math.max(500, Math.min(60000, sphericalRef.current.radius * zoomFactor));
    updateCameraPosition();
  };

  // Touch Navigation & Gestures for Mobile Devices
  const touchDistRef = useRef<number | null>(null);
  const touchMidpointRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      lastMousePosRef.current = { x: t.clientX, y: t.clientY };

      if (mobileTouchMode === 'orbit' || activeTool === 'orbit' || activeTool === 'pan') {
        isNavigatingRef.current = true;
        navModeRef.current = activeTool === 'pan' ? 'pan' : 'orbit';
      } else {
        handlePointerDown({
          clientX: t.clientX,
          clientY: t.clientY,
          button: 0,
        } as any);
      }
    } else if (e.touches.length === 2) {
      isNavigatingRef.current = true;
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      touchDistRef.current = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      touchMidpointRef.current = {
        x: (t0.clientX + t1.clientX) / 2,
        y: (t0.clientY + t1.clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      if (isNavigatingRef.current && navModeRef.current === 'orbit') {
        const dx = t.clientX - lastMousePosRef.current.x;
        const dy = t.clientY - lastMousePosRef.current.y;
        lastMousePosRef.current = { x: t.clientX, y: t.clientY };
        sphericalRef.current.theta -= dx * 0.009;
        sphericalRef.current.phi -= dy * 0.009;
        sphericalRef.current.phi = Math.max(
          0.05,
          Math.min(Math.PI / 2 - 0.02, sphericalRef.current.phi)
        );
        updateCameraPosition();
      } else {
        handlePointerMove({
          clientX: t.clientX,
          clientY: t.clientY,
        } as any);
      }
    } else if (
      e.touches.length === 2 &&
      touchDistRef.current !== null &&
      touchMidpointRef.current !== null
    ) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const newDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const newMidpoint = {
        x: (t0.clientX + t1.clientX) / 2,
        y: (t0.clientY + t1.clientY) / 2,
      };

      // Pinch to Zoom
      if (touchDistRef.current > 0 && newDist > 0) {
        const factor = touchDistRef.current / newDist;
        sphericalRef.current.radius = Math.max(
          500,
          Math.min(60000, sphericalRef.current.radius * factor)
        );
      }

      // Two-Finger Pan
      if (cameraRef.current) {
        const dx = newMidpoint.x - touchMidpointRef.current.x;
        const dy = newMidpoint.y - touchMidpointRef.current.y;
        const panSpeed = (sphericalRef.current.radius / 1500) * 1.5;
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRef.current.quaternion);
        const up = new THREE.Vector3(0, 1, 0);

        cameraTargetRef.current.addScaledVector(right, -dx * panSpeed);
        cameraTargetRef.current.addScaledVector(up, dy * panSpeed);
      }

      updateCameraPosition();
      touchDistRef.current = newDist;
      touchMidpointRef.current = newMidpoint;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) {
      isNavigatingRef.current = false;
      navModeRef.current = null;
      touchDistRef.current = null;
      touchMidpointRef.current = null;
      if (mobileTouchMode === 'draw') {
        const lastX = lastMousePosRef.current.x;
        const lastY = lastMousePosRef.current.y;
        handlePointerUp({ clientX: lastX, clientY: lastY, button: 0 } as any);
      }
    }
  };

  // Switch camera to preset view
  const setStandardView = (view: 'iso' | 'top' | 'front' | 'back' | 'left' | 'right') => {
    switch (view) {
      case 'iso':
        sphericalRef.current.set(7000, Math.PI / 3, Math.PI / 4);
        break;
      case 'top':
        sphericalRef.current.set(8000, 0.01, 0);
        break;
      case 'front':
        sphericalRef.current.set(6000, Math.PI / 2, 0);
        break;
      case 'back':
        sphericalRef.current.set(6000, Math.PI / 2, Math.PI);
        break;
      case 'left':
        sphericalRef.current.set(6000, Math.PI / 2, -Math.PI / 2);
        break;
      case 'right':
        sphericalRef.current.set(6000, Math.PI / 2, Math.PI / 2);
        break;
    }
    updateCameraPosition();
  };

  // Fit model to screen
  const fitModelToScreen = () => {
    if (objects.length === 0) {
      cameraTargetRef.current.set(0, 500, 0);
      sphericalRef.current.set(7000, Math.PI / 3, Math.PI / 4);
      updateCameraPosition();
      return;
    }

    const box = new THREE.Box3();
    for (const obj of objects) {
      const halfW = obj.dimensions.width / 2;
      const halfD = obj.dimensions.depth / 2;
      box.expandByPoint(new THREE.Vector3(obj.position.x - halfW, obj.position.y, obj.position.z - halfD));
      box.expandByPoint(
        new THREE.Vector3(obj.position.x + halfW, obj.position.y + obj.dimensions.height, obj.position.z + halfD)
      );
    }

    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z, 2000);
    cameraTargetRef.current.copy(center);
    sphericalRef.current.radius = maxDim * 2.2;
    updateCameraPosition();
  };

  // Expose standard view trigger via global custom event
  useEffect(() => {
    const handleCustomView = (e: any) => {
      if (e.detail?.view) setStandardView(e.detail.view);
      if (e.detail?.action === 'fit') fitModelToScreen();
    };
    window.addEventListener('structura_camera_action', handleCustomView);
    return () => window.removeEventListener('structura_camera_action', handleCustomView);
  }, [objects]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden"
      onMouseEnter={() => setIsPointerOverCanvas(true)}
      onMouseLeave={() => setIsPointerOverCanvas(false)}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none"
        onMouseMove={handlePointerMove}
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Floating Mobile Touch Mode Toggle (Orbit View vs Draw Mode) */}
      {!presentationMode && (
        <div className="md:hidden absolute top-3 left-3 z-20 flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-full p-0.5 shadow-xl">
          <button
            data-tour="tool-orbit-mobile"
            onClick={() => useModelStore.setState({ mobileTouchMode: 'orbit' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              mobileTouchMode === 'orbit'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Orbit size={13} />
            <span>Orbit</span>
          </button>
          <button
            onClick={() => useModelStore.setState({ mobileTouchMode: 'draw' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
              mobileTouchMode === 'draw'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pencil size={13} />
            <span className="capitalize">{activeTool}</span>
          </button>
        </div>
      )}

      {/* Floating 3D Snap & Inference Badge */}
      {isPointerOverCanvas && snapInfo && snapInfo.type !== 'none' && (
        <div
          className="pointer-events-none absolute z-20 flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium shadow-lg backdrop-blur-md transition-all duration-75"
          style={{
            left: `${cursorPosScreen.x + 18}px`,
            top: `${cursorPosScreen.y + 12}px`,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#f8fafc',
            border: `1.5px solid ${snapInfo.color}`,
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full inline-block shrink-0 animate-pulse"
            style={{ backgroundColor: snapInfo.color }}
          />
          <span>{snapInfo.label}</span>
        </div>
      )}

      {/* Quick Viewport Camera Toolbar Overlay (Top-Right of Canvas) */}
      {!presentationMode && (
        <div
          data-tour="camera-views"
          className="absolute top-4 right-4 z-10 flex items-center gap-1 p-1 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/60 shadow-lg text-slate-300"
        >
          <button
            onClick={() => setStandardView('iso')}
            title="Isometric 3D View"
            className="px-2 py-1 text-xs font-medium rounded hover:bg-slate-700/70 hover:text-white transition-colors"
          >
            Iso
          </button>
          <button
            onClick={() => setStandardView('top')}
            title="Top Floor Plan View"
            className="px-2 py-1 text-xs font-medium rounded hover:bg-slate-700/70 hover:text-white transition-colors"
          >
            Top
          </button>
          <button
            onClick={() => setStandardView('front')}
            title="Front Elevation View"
            className="px-2 py-1 text-xs font-medium rounded hover:bg-slate-700/70 hover:text-white transition-colors"
          >
            Front
          </button>
          <button
            onClick={() => setStandardView('right')}
            title="Right Side View"
            className="px-2 py-1 text-xs font-medium rounded hover:bg-slate-700/70 hover:text-white transition-colors"
          >
            Right
          </button>
          <div className="w-[1px] h-4 bg-slate-700 mx-1" />
          <button
            onClick={fitModelToScreen}
            title="Fit Model to Screen (Zoom Extents)"
            className="px-2 py-1 text-xs font-medium rounded hover:bg-slate-700/70 hover:text-white transition-colors"
          >
            Fit Extents
          </button>
        </div>
      )}
    </div>
  );
};
