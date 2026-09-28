import * as THREE from 'three';
import { ModelObject } from '../types/model';
import { createThreeMaterial, PRESET_MATERIALS } from './materials';

/**
 * Builds a composite Three.js Group representing procedural architectural and furniture items
 */
export function buildProceduralMesh(obj: ModelObject): THREE.Object3D {
  const group = new THREE.Group();
  group.name = obj.id;
  group.userData = { id: obj.id, modelObject: obj };

  const { dimensions, architecturalProps } = obj;
  const { width, height, depth } = dimensions;

  // Base materials
  const defaultMat = createThreeMaterial(
    PRESET_MATERIALS.find((m) => m.id === obj.materialId) || PRESET_MATERIALS[0],
    obj.color
  );
  const woodMat = createThreeMaterial(PRESET_MATERIALS.find((m) => m.id === 'wood-natural-oak'));
  const darkWoodMat = createThreeMaterial(PRESET_MATERIALS.find((m) => m.id === 'wood-walnut'));
  const metalMat = createThreeMaterial(PRESET_MATERIALS.find((m) => m.id === 'metal-brushed-steel'));
  const blackMetalMat = createThreeMaterial(PRESET_MATERIALS.find((m) => m.id === 'metal-matte-black'));
  const brassMat = createThreeMaterial(PRESET_MATERIALS.find((m) => m.id === 'metal-satin-brass'));
  const glassMat = createThreeMaterial(PRESET_MATERIALS.find((m) => m.id === 'glass-clear'));
  const fabricMat = createThreeMaterial(PRESET_MATERIALS.find((m) => m.id === 'fabric-natural-linen'));
  const charcoalFabricMat = createThreeMaterial(PRESET_MATERIALS.find((m) => m.id === 'fabric-charcoal-weave'));
  const marbleMat = createThreeMaterial(PRESET_MATERIALS.find((m) => m.id === 'tiles-carrara-marble'));
  const whiteMat = createThreeMaterial(PRESET_MATERIALS.find((m) => m.id === 'paint-pure-white'));

  const compType = architecturalProps?.componentType || obj.type;

  switch (compType) {
    case 'door': {
      // Parametric Door: Frame + Door Leaf + Lever Handle
      const frameThick = 45;
      const leafThick = 35;
      const frameDepth = dimensions.thickness || 150;

      // Frame Left
      const frameL = new THREE.Mesh(
        new THREE.BoxGeometry(frameThick, height, frameDepth),
        darkWoodMat
      );
      frameL.position.set(-width / 2 + frameThick / 2, height / 2, 0);
      group.add(frameL);

      // Frame Right
      const frameR = new THREE.Mesh(
        new THREE.BoxGeometry(frameThick, height, frameDepth),
        darkWoodMat
      );
      frameR.position.set(width / 2 - frameThick / 2, height / 2, 0);
      group.add(frameR);

      // Frame Top Head
      const frameT = new THREE.Mesh(
        new THREE.BoxGeometry(width, frameThick, frameDepth),
        darkWoodMat
      );
      frameT.position.set(0, height - frameThick / 2, 0);
      group.add(frameT);

      // Door Leaf (slightly ajar or flush)
      const leafW = width - frameThick * 2;
      const leafH = height - frameThick;
      const leaf = new THREE.Mesh(
        new THREE.BoxGeometry(leafW, leafH, leafThick),
        woodMat
      );
      leaf.position.set(0, leafH / 2, 0);
      group.add(leaf);

      // Door Handle (Lever)
      const handleBase = new THREE.Mesh(
        new THREE.CylinderGeometry(15, 15, 10, 16),
        metalMat
      );
      handleBase.rotation.x = Math.PI / 2;
      handleBase.position.set(leafW / 2 - 50, 1000, leafThick / 2 + 5);
      group.add(handleBase);

      const handleLever = new THREE.Mesh(
        new THREE.BoxGeometry(100, 12, 16),
        metalMat
      );
      handleLever.position.set(leafW / 2 - 95, 1000, leafThick / 2 + 15);
      group.add(handleLever);
      break;
    }

    case 'window': {
      // Parametric Window: Outer Frame + Divider Mullions + Glass Pane
      const frameThick = 40;
      const frameDepth = dimensions.thickness || 140;

      // Outer Frame Box with hole or composite frame
      const frameT = new THREE.Mesh(new THREE.BoxGeometry(width, frameThick, frameDepth), blackMetalMat);
      frameT.position.set(0, height - frameThick / 2, 0);
      group.add(frameT);

      const frameB = new THREE.Mesh(new THREE.BoxGeometry(width, frameThick, frameDepth), blackMetalMat);
      frameB.position.set(0, frameThick / 2, 0);
      group.add(frameB);

      const frameL = new THREE.Mesh(new THREE.BoxGeometry(frameThick, height - frameThick * 2, frameDepth), blackMetalMat);
      frameL.position.set(-width / 2 + frameThick / 2, height / 2, 0);
      group.add(frameL);

      const frameR = new THREE.Mesh(new THREE.BoxGeometry(frameThick, height - frameThick * 2, frameDepth), blackMetalMat);
      frameR.position.set(width / 2 - frameThick / 2, height / 2, 0);
      group.add(frameR);

      // Center Mullion
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(frameThick * 0.75, height - frameThick * 2, frameDepth * 0.8), blackMetalMat);
      mullion.position.set(0, height / 2, 0);
      group.add(mullion);

      // Glass Pane
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(width - frameThick * 2, height - frameThick * 2, 10),
        glassMat
      );
      glass.position.set(0, height / 2, 0);
      group.add(glass);
      break;
    }

    case 'queenBed':
    case 'singleBed': {
      // Bed Frame & Headboard
      const headH = 950;
      const headThick = 60;
      const headboard = new THREE.Mesh(
        new THREE.BoxGeometry(width, headH, headThick),
        woodMat
      );
      headboard.position.set(0, headH / 2, -depth / 2 + headThick / 2);
      group.add(headboard);

      // Mattress Base
      const baseH = 250;
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(width, baseH, depth - headThick),
        darkWoodMat
      );
      base.position.set(0, baseH / 2, headThick / 2);
      group.add(base);

      // Mattress
      const mattH = 260;
      const mattress = new THREE.Mesh(
        new THREE.BoxGeometry(width - 40, mattH, depth - headThick - 30),
        fabricMat
      );
      mattress.position.set(0, baseH + mattH / 2, headThick / 2);
      group.add(mattress);

      // Pillows
      const pillowW = width > 1200 ? (width - 150) / 2 : width - 100;
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(pillowW, 120, 360), whiteMat);
      p1.position.set(width > 1200 ? -pillowW / 2 - 15 : 0, baseH + mattH + 50, -depth / 2 + headThick + 220);
      group.add(p1);

      if (width > 1200) {
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(pillowW, 120, 360), whiteMat);
        p2.position.set(pillowW / 2 + 15, baseH + mattH + 50, -depth / 2 + headThick + 220);
        group.add(p2);
      }
      break;
    }

    case 'diningTable':
    case 'coffeeTable':
    case 'officeDesk': {
      const topThick = compType === 'diningTable' ? 40 : 30;
      const legThick = 45;

      // Tabletop
      const tableTop = new THREE.Mesh(
        new THREE.BoxGeometry(width, topThick, depth),
        compType === 'officeDesk' ? marbleMat : woodMat
      );
      tableTop.position.set(0, height - topThick / 2, 0);
      group.add(tableTop);

      // 4 Legs
      const legH = height - topThick;
      const legGeom = new THREE.BoxGeometry(legThick, legH, legThick);
      const legMat = compType === 'officeDesk' ? blackMetalMat : woodMat;

      const legPositions = [
        [-width / 2 + legThick, legH / 2, -depth / 2 + legThick],
        [width / 2 - legThick, legH / 2, -depth / 2 + legThick],
        [width / 2 - legThick, legH / 2, depth / 2 - legThick],
        [-width / 2 + legThick, legH / 2, depth / 2 - legThick],
      ];

      for (const pos of legPositions) {
        const leg = new THREE.Mesh(legGeom, legMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        group.add(leg);
      }
      break;
    }

    case 'diningChair':
    case 'officeChair':
    case 'armchair': {
      const seatH = 450;
      const seatThick = 40;

      // Seat Cushion
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(width, seatThick, depth * 0.8),
        charcoalFabricMat
      );
      seat.position.set(0, seatH, 0);
      group.add(seat);

      // Backrest
      const backH = height - seatH;
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(width * 0.95, backH, 35),
        charcoalFabricMat
      );
      back.position.set(0, seatH + backH / 2, -depth * 0.4 + 17);
      group.add(back);

      // Legs
      const legH = seatH - seatThick / 2;
      const legGeom = new THREE.CylinderGeometry(14, 10, legH, 12);
      const legPositions = [
        [-width / 2 + 30, legH / 2, -depth * 0.4 + 30],
        [width / 2 - 30, legH / 2, -depth * 0.4 + 30],
        [width / 2 - 30, legH / 2, depth * 0.4 - 30],
        [-width / 2 + 30, legH / 2, depth * 0.4 - 30],
      ];
      for (const pos of legPositions) {
        const leg = new THREE.Mesh(legGeom, blackMetalMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        group.add(leg);
      }
      break;
    }

    case 'sofa3Seat':
    case 'sofaSectional': {
      const baseH = 220;
      const cushionH = 180;
      const armW = 140;
      const backThick = 150;

      // Base
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(width, baseH, depth),
        darkWoodMat
      );
      base.position.set(0, baseH / 2, 0);
      group.add(base);

      // Left Arm
      const armL = new THREE.Mesh(
        new THREE.BoxGeometry(armW, height * 0.65, depth),
        charcoalFabricMat
      );
      armL.position.set(-width / 2 + armW / 2, height * 0.325, 0);
      group.add(armL);

      // Right Arm
      const armR = new THREE.Mesh(
        new THREE.BoxGeometry(armW, height * 0.65, depth),
        charcoalFabricMat
      );
      armR.position.set(width / 2 - armW / 2, height * 0.325, 0);
      group.add(armR);

      // Backrest
      const backW = width - armW * 2;
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(backW, height - baseH, backThick),
        charcoalFabricMat
      );
      back.position.set(0, baseH + (height - baseH) / 2, -depth / 2 + backThick / 2);
      group.add(back);

      // Cushions
      const seatCount = 3;
      const seatW = (width - armW * 2) / seatCount;
      const seatD = depth - backThick;
      for (let i = 0; i < seatCount; i++) {
        const cushion = new THREE.Mesh(
          new THREE.BoxGeometry(seatW - 10, cushionH, seatD - 10),
          charcoalFabricMat
        );
        cushion.position.set(
          -width / 2 + armW + seatW * (i + 0.5),
          baseH + cushionH / 2,
          backThick / 2
        );
        group.add(cushion);
      }
      break;
    }

    case 'kitchenBaseCabinet':
    case 'kitchenIsland':
    case 'kitchenCounterSink': {
      const kickH = 100;
      const counterThick = 40;
      const carcaseH = height - kickH - counterThick;

      // Toe kick
      const toeKick = new THREE.Mesh(
        new THREE.BoxGeometry(width, kickH, depth - 50),
        blackMetalMat
      );
      toeKick.position.set(0, kickH / 2, -25);
      group.add(toeKick);

      // Cabinet Body
      const carcase = new THREE.Mesh(
        new THREE.BoxGeometry(width, carcaseH, depth),
        defaultMat
      );
      carcase.position.set(0, kickH + carcaseH / 2, 0);
      group.add(carcase);

      // Countertop
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(width + 20, counterThick, depth + 20),
        marbleMat
      );
      counter.position.set(0, height - counterThick / 2, 0);
      group.add(counter);

      // Handles
      const handle = new THREE.Mesh(new THREE.BoxGeometry(160, 15, 20), brassMat);
      handle.position.set(0, height - counterThick - 60, depth / 2 + 10);
      group.add(handle);

      // If Sink
      if (compType === 'kitchenCounterSink') {
        const basin = new THREE.Mesh(new THREE.BoxGeometry(width * 0.55, 10, depth * 0.6), metalMat);
        basin.position.set(0, height - 5, 0);
        group.add(basin);

        // Gooseneck Faucet
        const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 180, 16), metalMat);
        faucetBase.position.set(0, height + 90, -depth * 0.2);
        group.add(faucetBase);
      }
      break;
    }

    case 'refrigerator': {
      // Refrigerator body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        metalMat
      );
      body.position.set(0, height / 2, 0);
      group.add(body);

      // Door seam line
      const seam = new THREE.Mesh(new THREE.BoxGeometry(4, height - 100, depth + 4), blackMetalMat);
      seam.position.set(0, height / 2, 2);
      group.add(seam);

      // Long vertical handles
      const handleL = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 600, 16), blackMetalMat);
      handleL.position.set(-25, height / 2, depth / 2 + 25);
      group.add(handleL);

      const handleR = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 600, 16), blackMetalMat);
      handleR.position.set(25, height / 2, depth / 2 + 25);
      group.add(handleR);
      break;
    }

    case 'wardrobe':
    case 'bookshelf': {
      const outer = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        woodMat
      );
      outer.position.set(0, height / 2, 0);
      group.add(outer);

      if (compType === 'bookshelf') {
        // Shelf dividers
        const shelves = 4;
        for (let i = 1; i <= shelves; i++) {
          const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(width - 40, 25, depth - 20),
            darkWoodMat
          );
          shelf.position.set(0, (height / (shelves + 1)) * i, 0);
          group.add(shelf);
        }
      }
      break;
    }

    case 'bathroomVanity': {
      const cabinetH = height - 100;
      const cab = new THREE.Mesh(new THREE.BoxGeometry(width, cabinetH, depth), darkWoodMat);
      cab.position.set(0, cabinetH / 2, 0);
      group.add(cab);

      const top = new THREE.Mesh(new THREE.BoxGeometry(width + 20, 40, depth + 20), marbleMat);
      top.position.set(0, cabinetH + 20, 0);
      group.add(top);

      // Ceramic Basin
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(200, 160, 120, 24), whiteMat);
      basin.position.set(0, cabinetH + 40 + 60, 0);
      group.add(basin);
      break;
    }

    case 'bathtub': {
      const tub = new THREE.Mesh(
        new THREE.CylinderGeometry(width / 2, width / 2.3, height, 32),
        whiteMat
      );
      tub.scale.set(1, 1, depth / width);
      tub.position.set(0, height / 2, 0);
      group.add(tub);
      break;
    }

    case 'toilet': {
      const base = new THREE.Mesh(new THREE.BoxGeometry(width * 0.8, height * 0.5, depth * 0.7), whiteMat);
      base.position.set(0, height * 0.25, depth * 0.1);
      group.add(base);

      const tank = new THREE.Mesh(new THREE.BoxGeometry(width, height * 0.5, depth * 0.35), whiteMat);
      tank.position.set(0, height * 0.75, -depth * 0.3);
      group.add(tank);
      break;
    }

    case 'cylinder': {
      const radius = dimensions.radius || width / 2;
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, dimensions.sides || 32),
        defaultMat
      );
      cyl.position.set(0, height / 2, 0);
      group.add(cyl);
      break;
    }

    case 'wall': {
      // 3D Wall geometry with clean thickness and height
      const wallGeom = new THREE.BoxGeometry(width, height, depth);
      const wallMesh = new THREE.Mesh(wallGeom, defaultMat);
      wallMesh.position.set(0, height / 2, 0);
      group.add(wallMesh);
      break;
    }

    case 'face': {
      // 2D polygon face or coplanar sheet
      if (obj.faces && obj.faces.length > 0) {
        for (const faceData of obj.faces) {
          const shape = new THREE.Shape();
          if (faceData.points.length >= 3) {
            shape.moveTo(faceData.points[0].x, -faceData.points[0].z);
            for (let i = 1; i < faceData.points.length; i++) {
              shape.lineTo(faceData.points[i].x, -faceData.points[i].z);
            }
            shape.closePath();

            const geom = new THREE.ShapeGeometry(shape);
            const mesh = new THREE.Mesh(geom, defaultMat);
            mesh.rotation.x = -Math.PI / 2; // Flat on X-Z plane
            mesh.position.set(0, 0, 0);
            group.add(mesh);
          }
        }
      } else {
        // Fallback quad
        const planeGeom = new THREE.PlaneGeometry(width, depth);
        const planeMesh = new THREE.Mesh(planeGeom, defaultMat);
        planeMesh.rotation.x = -Math.PI / 2;
        group.add(planeMesh);
      }
      break;
    }

    case 'box':
    default: {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        defaultMat
      );
      box.position.set(0, height / 2, 0);
      group.add(box);
      break;
    }
  }

  // Cast and receive shadows
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return group;
}
