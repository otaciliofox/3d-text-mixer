import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { MATERIAL_SETTINGS, DEFAULT_EXTRUDE_SETTINGS } from '../constants/config.js';

/**
 * Converts an OpenType path to an array of THREE.Shape.
 * 
 * @param {opentype.Path} path 
 * @returns {THREE.Shape[]}
 */
export function convertPathToShapes(path) {
  const svgPath = path.toSVG();
  
  const loader = new SVGLoader();
  const svgData = loader.parse(`<svg>${svgPath}</svg>`);
  
  const shapes = [];
  for (const p of svgData.paths) {
    shapes.push(...p.toShapes(true));
  }
  
  return shapes;
}

/**
 * Generates a 3D Text Mesh (Glyph by Glyph to fix floating accents).
 * 
 * @param {string} text 
 * @param {opentype.Font} font 
 * @param {number} fontSize 
 * @param {number} spacing 
 * @param {number} depth 
 * @param {number} color Hex color
 * @param {boolean} isBackground 
 * @param {number} accentOffset 
 * @returns {Object} { group, width, height }
 */
export function createTextMesh(text, font, fontSize, spacing, depth, color, isBackground, accentOffset = 2) {
  const extrudeSettings = { ...DEFAULT_EXTRUDE_SETTINGS, depth };
  const material = new THREE.MeshStandardMaterial({ color, ...MATERIAL_SETTINGS });
  
  const group = new THREE.Group();
  let x = 0;
  
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let hasValidShapes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const glyph = font.charToGlyph(char);
    const glyphPath = glyph.getPath(x, 0, fontSize);
    const advanceWidth = glyph.advanceWidth * (fontSize / font.unitsPerEm);
    x += advanceWidth + spacing;
    
    if (char.trim() === '') continue;
    
    const shapes = convertPathToShapes(glyphPath);
    if (shapes.length === 0) continue;
    
    const glyphMeshes = [];
    
    shapes.forEach(shape => {
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.rotation.x = Math.PI; // SVGLoader inversion
      mesh.position.z = depth; // Restore Z to [0, depth]
      
      mesh.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(mesh);
      const area = (box.max.x - box.min.x) * (box.max.y - box.min.y);
      
      glyphMeshes.push({ mesh, box, area });
      group.add(mesh);
    });
    
    // Glue floating accents and dots
    if (glyphMeshes.length > 1) {
      glyphMeshes.sort((a, b) => b.area - a.area);
      const baseMesh = glyphMeshes[0];
      
      for (let j = 1; j < glyphMeshes.length; j++) {
        const floating = glyphMeshes[j];
        const overlap = accentOffset;
        
        if (floating.box.min.y > baseMesh.box.max.y - overlap) {
          // Floating above (e.g., é, i)
          const shiftY = floating.box.min.y - baseMesh.box.max.y + overlap;
          floating.mesh.position.y -= shiftY;
          floating.box.translate(new THREE.Vector3(0, -shiftY, 0));
        } else if (floating.box.max.y < baseMesh.box.min.y + overlap) {
          // Floating below (e.g., !)
          const shiftY = baseMesh.box.min.y - floating.box.max.y + overlap;
          floating.mesh.position.y += shiftY;
          floating.box.translate(new THREE.Vector3(0, shiftY, 0));
        }
      }
    }
    
    // Track overall bounds
    glyphMeshes.forEach(m => {
      minX = Math.min(minX, m.box.min.x);
      maxX = Math.max(maxX, m.box.max.x);
      minY = Math.min(minY, m.box.min.y);
      maxY = Math.max(maxY, m.box.max.y);
      hasValidShapes = true;
    });
  }
  
  const width = hasValidShapes ? (maxX - minX) : 0;
  const height = hasValidShapes ? (maxY - minY) : 0;
  
  if (hasValidShapes) {
    // Center the group mathematically
    group.position.x = - (maxX + minX) / 2;
    group.position.y = - (maxY + minY) / 2;
  }
  
  return { group, width, height };
}

/**
 * Creates a decoration 3D mesh.
 * 
 * @param {string} type 
 * @param {number} depth 
 * @returns {THREE.Group}
 */
export function createDecoration(type, depth) {
  const shape = new THREE.Shape();
  
  if (type === 'heart') {
    const x = 0, y = 0;
    shape.moveTo( x + 5, y + 5 );
    shape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
    shape.bezierCurveTo( x - 6, y, x - 6, y + 7, x - 6, y + 7 );
    shape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
    shape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
    shape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
    shape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );
  } else if (type === 'star') {
    const innerRadius = 5;
    const outerRadius = 10;
    const pts = 5;
    for ( let i = 0; i < pts * 2; i ++ ) {
      const radius = i % 2 === 1 ? innerRadius : outerRadius;
      const angle = ( i / ( pts * 2 ) ) * Math.PI * 2;
      shape[ i === 0 ? 'moveTo' : 'lineTo' ]( Math.sin( angle ) * radius, Math.cos( angle ) * radius );
    }
  } else if (type === 'circle') {
    shape.absarc(0, 0, 10, 0, Math.PI * 2, false);
  } else if (type === 'diamond') {
    shape.moveTo(0, 10);
    shape.lineTo(10, 0);
    shape.lineTo(0, -10);
    shape.lineTo(-10, 0);
    shape.lineTo(0, 10);
  } else if (type === 'crown') {
    shape.moveTo(-10, -5);
    shape.lineTo(-10, 5);
    shape.lineTo(-5, 0);
    shape.lineTo(0, 8);
    shape.lineTo(5, 0);
    shape.lineTo(10, 5);
    shape.lineTo(10, -5);
    shape.lineTo(-10, -5);
  }

  const extrudeSettings = { ...DEFAULT_EXTRUDE_SETTINGS, depth };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, ...MATERIAL_SETTINGS });
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  
  if (type === 'heart') {
    mesh.rotation.x = Math.PI; // Flip heart to be right side up
    mesh.position.z = depth;
  }
  
  mesh.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(mesh);
  
  mesh.position.x -= (box.max.x + box.min.x) / 2;
  mesh.position.y -= (box.max.y + box.min.y) / 2;
  
  const group = new THREE.Group();
  group.add(mesh);
  
  return group;
}
