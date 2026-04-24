import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

/**
 * Exports the given THREE.Group as an STL file.
 * 
 * @param {THREE.Group} modelGroup 
 * @param {string} filename 
 */
export function exportSTL(modelGroup, filename = '3d-text.stl') {
  const exporter = new STLExporter();
  const stlString = exporter.parse(modelGroup);
  
  const blob = new Blob([stlString], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}
