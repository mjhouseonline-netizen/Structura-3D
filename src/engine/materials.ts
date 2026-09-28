import * as THREE from 'three';
import { MaterialDef } from '../types/model';

// Procedural texture cache to avoid memory re-allocations
const textureCache = new Map<string, THREE.CanvasTexture>();

export const PRESET_MATERIALS: MaterialDef[] = [
  // Paints
  {
    id: 'paint-pure-white',
    name: 'Pure White',
    category: 'paint',
    color: '#f8fafc',
    roughness: 0.6,
    metalness: 0.0,
  },
  {
    id: 'paint-warm-white',
    name: 'Warm White',
    category: 'paint',
    color: '#f4efe6',
    roughness: 0.65,
    metalness: 0.0,
  },
  {
    id: 'paint-sage-green',
    name: 'Sage Green',
    category: 'paint',
    color: '#849b88',
    roughness: 0.6,
    metalness: 0.0,
  },
  {
    id: 'paint-charcoal',
    name: 'Charcoal Accent',
    category: 'paint',
    color: '#2d3748',
    roughness: 0.7,
    metalness: 0.05,
  },
  {
    id: 'paint-navy',
    name: 'Deep Navy',
    category: 'paint',
    color: '#1e293b',
    roughness: 0.65,
    metalness: 0.05,
  },
  {
    id: 'paint-terracotta',
    name: 'Terracotta',
    category: 'paint',
    color: '#c26d53',
    roughness: 0.75,
    metalness: 0.0,
  },

  // Timber / Wood
  {
    id: 'wood-natural-oak',
    name: 'Natural Oak',
    category: 'wood',
    color: '#c8a374',
    roughness: 0.45,
    metalness: 0.02,
    texturePattern: 'wood-grain',
  },
  {
    id: 'wood-walnut',
    name: 'Rich Walnut',
    category: 'wood',
    color: '#5c4033',
    roughness: 0.4,
    metalness: 0.02,
    texturePattern: 'wood-grain-dark',
  },
  {
    id: 'wood-scandinavian-pine',
    name: 'Scandinavian Pine',
    category: 'wood',
    color: '#e2c59f',
    roughness: 0.5,
    metalness: 0.0,
    texturePattern: 'wood-grain',
  },
  {
    id: 'wood-smoked-ash',
    name: 'Smoked Ash',
    category: 'wood',
    color: '#3e3734',
    roughness: 0.55,
    metalness: 0.05,
    texturePattern: 'wood-grain-dark',
  },

  // Flooring
  {
    id: 'floor-oak-parquet',
    name: 'Herringbone Parquet',
    category: 'flooring',
    color: '#bfa079',
    roughness: 0.38,
    metalness: 0.05,
    texturePattern: 'parquet',
  },
  {
    id: 'floor-light-planks',
    name: 'Light Timber Planks',
    category: 'flooring',
    color: '#d6c4a8',
    roughness: 0.45,
    metalness: 0.02,
    texturePattern: 'planks',
  },
  {
    id: 'floor-terrazzo',
    name: 'Modern Terrazzo',
    category: 'flooring',
    color: '#e8e6e3',
    roughness: 0.35,
    metalness: 0.08,
    texturePattern: 'terrazzo',
  },

  // Tiles
  {
    id: 'tiles-subway-white',
    name: 'Subway Gloss White',
    category: 'tiles',
    color: '#ffffff',
    roughness: 0.18,
    metalness: 0.1,
    texturePattern: 'subway-tiles',
  },
  {
    id: 'tiles-carrara-marble',
    name: 'Carrara Marble',
    category: 'tiles',
    color: '#f0f2f5',
    roughness: 0.15,
    metalness: 0.1,
    texturePattern: 'marble',
  },
  {
    id: 'tiles-hex-charcoal',
    name: 'Charcoal Hexagon',
    category: 'tiles',
    color: '#334155',
    roughness: 0.45,
    metalness: 0.05,
    texturePattern: 'hexagon',
  },

  // Stone
  {
    id: 'stone-granite',
    name: 'Salt & Pepper Granite',
    category: 'stone',
    color: '#71717a',
    roughness: 0.4,
    metalness: 0.1,
    texturePattern: 'granite',
  },
  {
    id: 'stone-limestone',
    name: 'Warm Limestone',
    category: 'stone',
    color: '#d4ccb9',
    roughness: 0.65,
    metalness: 0.0,
    texturePattern: 'limestone',
  },

  // Concrete
  {
    id: 'concrete-polished',
    name: 'Polished Concrete',
    category: 'concrete',
    color: '#9ca3af',
    roughness: 0.32,
    metalness: 0.05,
    texturePattern: 'concrete',
  },
  {
    id: 'concrete-industrial',
    name: 'Industrial Cast Concrete',
    category: 'concrete',
    color: '#64748b',
    roughness: 0.8,
    metalness: 0.02,
    texturePattern: 'concrete-rough',
  },

  // Metal
  {
    id: 'metal-brushed-steel',
    name: 'Brushed Stainless',
    category: 'metal',
    color: '#d1d5db',
    roughness: 0.3,
    metalness: 0.85,
  },
  {
    id: 'metal-satin-brass',
    name: 'Satin Brass / Gold',
    category: 'metal',
    color: '#d4af37',
    roughness: 0.35,
    metalness: 0.85,
  },
  {
    id: 'metal-matte-black',
    name: 'Matte Black Hardware',
    category: 'metal',
    color: '#171717',
    roughness: 0.5,
    metalness: 0.6,
  },

  // Glass
  {
    id: 'glass-clear',
    name: 'Architectural Clear Glass',
    category: 'glass',
    color: '#e0f2fe',
    roughness: 0.05,
    metalness: 0.1,
    opacity: 0.35,
    transparent: true,
  },
  {
    id: 'glass-frosted',
    name: 'Frosted Privacy Glass',
    category: 'glass',
    color: '#f1f5f9',
    roughness: 0.55,
    metalness: 0.05,
    opacity: 0.65,
    transparent: true,
  },

  // Fabric
  {
    id: 'fabric-natural-linen',
    name: 'Textured Linen',
    category: 'fabric',
    color: '#e2ded5',
    roughness: 0.9,
    metalness: 0.0,
    texturePattern: 'fabric-weave',
  },
  {
    id: 'fabric-charcoal-weave',
    name: 'Charcoal Weave',
    category: 'fabric',
    color: '#374151',
    roughness: 0.88,
    metalness: 0.0,
    texturePattern: 'fabric-weave',
  },
  {
    id: 'fabric-cognac-leather',
    name: 'Cognac Leather',
    category: 'fabric',
    color: '#9a4e2b',
    roughness: 0.42,
    metalness: 0.08,
  },
];

/**
 * Creates a procedural canvas texture for architectural realism
 */
export function getProceduralTexture(pattern: string, baseColorHex: string): THREE.CanvasTexture {
  const cacheKey = `${pattern}-${baseColorHex}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 512, 512);

  if (pattern === 'wood-grain' || pattern === 'wood-grain-dark') {
    // Subtle wood rings and grain
    for (let y = 0; y < 512; y += 4) {
      const alpha = Math.sin(y * 0.08) * 0.06 + Math.random() * 0.04;
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, y, 512, 3);
    }
  } else if (pattern === 'planks') {
    // Long horizontal timber plank seams
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 2;
    for (let y = 0; y <= 512; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();

      // Staggered vertical joints
      const xOffset = (y / 64) % 2 === 0 ? 128 : 256;
      for (let x = xOffset; x < 512; x += 256) {
        ctx.beginPath();
        ctx.moveTo(x, y - 64);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  } else if (pattern === 'parquet') {
    // Herringbone pattern
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = 2;
    const step = 32;
    for (let x = 0; x < 512; x += step) {
      for (let y = 0; y < 512; y += step * 2) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + step, y + step);
        ctx.lineTo(x, y + step * 2);
        ctx.stroke();
      }
    }
  } else if (pattern === 'subway-tiles') {
    // Crisp subway tile grid
    ctx.strokeStyle = 'rgba(150, 160, 170, 0.4)';
    ctx.lineWidth = 3;
    for (let y = 0; y <= 512; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
      const xShift = (y / 40) % 2 === 0 ? 0 : 40;
      for (let x = xShift; x <= 512; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 40);
        ctx.stroke();
      }
    }
  } else if (pattern === 'marble') {
    // Soft elegant marble veining
    ctx.strokeStyle = 'rgba(180, 190, 205, 0.25)';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      let cx = Math.random() * 512;
      let cy = 0;
      ctx.moveTo(cx, cy);
      while (cy < 512) {
        cx += (Math.random() - 0.48) * 40;
        cy += 30;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
  } else if (pattern === 'hexagon') {
    // Honeycomb hexagonal tiles
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    const r = 24;
    const h = r * Math.sqrt(3);
    for (let y = 0; y < 512 + h; y += h) {
      for (let x = 0; x < 512 + r * 3; x += r * 3) {
        drawHexagon(ctx, x, y, r);
        drawHexagon(ctx, x + 1.5 * r, y + h / 2, r);
      }
    }
  } else if (pattern === 'terrazzo' || pattern === 'granite') {
    // Speckled aggregate chips
    const speckColors = ['#1e293b', '#94a3b8', '#d97706', '#cbd5e1', '#334155'];
    for (let i = 0; i < 400; i++) {
      const sx = Math.random() * 512;
      const sy = Math.random() * 512;
      const size = Math.random() * 5 + 1.5;
      ctx.fillStyle = speckColors[Math.floor(Math.random() * speckColors.length)];
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (pattern === 'concrete' || pattern === 'concrete-rough') {
    // Fine noise and slight mottled patches
    for (let i = 0; i < 1500; i++) {
      const nx = Math.random() * 512;
      const ny = Math.random() * 512;
      const gray = Math.floor(Math.random() * 40) - 20;
      ctx.fillStyle = `rgba(${128 + gray}, ${128 + gray}, ${128 + gray}, 0.12)`;
      ctx.fillRect(nx, ny, Math.random() * 4 + 1, Math.random() * 4 + 1);
    }
  } else if (pattern === 'fabric-weave') {
    // Cross-hatch fabric weave
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let i = 0; i < 512; i += 4) {
      ctx.fillRect(i, 0, 2, 512);
      ctx.fillRect(0, i, 512, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);

  textureCache.set(cacheKey, texture);
  return texture;
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + r * Math.cos(angle);
    const hy = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * Creates or retrieves a Three.js MeshStandardMaterial for a given MaterialDef or color
 */
export function createThreeMaterial(
  matDef?: MaterialDef,
  customColor?: string
): THREE.MeshStandardMaterial {
  const color = customColor || matDef?.color || '#e2e8f0';
  const roughness = matDef?.roughness ?? 0.5;
  const metalness = matDef?.metalness ?? 0.05;
  const opacity = matDef?.opacity ?? 1.0;
  const transparent = matDef?.transparent ?? false;

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness,
    metalness,
    transparent,
    opacity,
    side: THREE.DoubleSide,
  });

  if (matDef?.texturePattern) {
    const tex = getProceduralTexture(matDef.texturePattern, color);
    mat.map = tex;
    mat.needsUpdate = true;
  }

  return mat;
}
