import './styles/main.css';
import * as THREE from 'three';
import { BLOCK_FONTS, CURSIVE_FONTS } from './constants/fonts.js';
import { loadFont } from './utils/fontLoader.js';
import { debounce } from './utils/debounce.js';
import { SceneManager } from './core/SceneManager.js';
import { createTextMesh, createDecoration } from './core/GeometryBuilder.js';
import { exportSTL } from './core/Exporter.js';
import { setupCustomDropdown, initGlobalDropdownListeners } from './ui/CustomDropdown.js';

// Application State
const state = {
  bgFont: 'Anton',
  fgFont: 'Pacifico'
};

// UI Elements Map
const ui = {
  bgText: document.getElementById('bg-text'),
  bgSize: document.getElementById('bg-size'),
  bgSpacing: document.getElementById('bg-spacing'),
  bgDepth: document.getElementById('bg-depth'),
  bgBase: document.getElementById('bg-base'),
  baseSettings: document.getElementById('base-settings'),
  basePadding: document.getElementById('base-padding'),
  baseDepth: document.getElementById('base-depth'),
  baseOffsetY: document.getElementById('base-offset-y'),
  baseOffsetZ: document.getElementById('base-offset-z'),
  fgText: document.getElementById('fg-text'),
  fgSize: document.getElementById('fg-size'),
  fgSpacing: document.getElementById('fg-spacing'),
  fgDepth: document.getElementById('fg-depth'),
  fgOffsetX: document.getElementById('fg-offset-x'),
  fgOffsetY: document.getElementById('fg-offset-y'),
  accentOffset: document.getElementById('accent-offset'),
  decoShape: document.getElementById('deco-shape'),
  decoSettings: document.getElementById('deco-settings'),
  decoSize: document.getElementById('deco-size'),
  decoOffsetX: document.getElementById('deco-offset-x'),
  decoOffsetY: document.getElementById('deco-offset-y'),
  btnExport: document.getElementById('btn-export'),
  loading: document.getElementById('loading')
};

const sceneManager = new SceneManager('canvas-container');

async function generateModel() {
  try {
    ui.loading.classList.remove('hidden');
    sceneManager.clearModel();
    
    const bgTextStr = ui.bgText.value || ' ';
    const fgTextStr = ui.fgText.value;
    
    // Calculate responsive scale based on viewport (vw-like logic for 3D)
    const isMobile = window.innerWidth <= 768;
    const vwScale = isMobile ? (window.innerWidth / 400) : 1; 

    const bgSize = parseFloat(ui.bgSize.value) * vwScale;
    const bgSpacing = parseFloat(ui.bgSpacing.value);
    const bgDepth = parseFloat(ui.bgDepth.value);
    
    const fgSize = parseFloat(ui.fgSize.value) * vwScale;
    const fgSpacing = parseFloat(ui.fgSpacing.value);
    const fgDepth = parseFloat(ui.fgDepth.value);
    const fgOffsetX = parseFloat(ui.fgOffsetX.value);
    const fgOffsetY = parseFloat(ui.fgOffsetY.value);
    const accentOffsetVal = parseFloat(ui.accentOffset.value);
    
    const [bgFont, fgFont] = await Promise.all([
      loadFont(state.bgFont),
      fgTextStr ? loadFont(state.fgFont) : Promise.resolve(null)
    ]);
    
    // Create Background Text
    const bgResult = createTextMesh(bgTextStr, bgFont, bgSize, bgSpacing, bgDepth, 0xffb6c1, true, accentOffsetVal);
    bgResult.group.position.z = 0;
    sceneManager.addToModel(bgResult.group);
    
    // Base Connection
    if (ui.bgBase.value !== 'none') {
      const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.3, metalness: 0.1 });
      let baseGeom;
      const padding = parseFloat(ui.basePadding.value);
      const bDepth = parseFloat(ui.baseDepth.value);
      const bOffsetY = parseFloat(ui.baseOffsetY.value);
      const bOffsetZ = parseFloat(ui.baseOffsetZ.value);
      
      if (ui.bgBase.value === 'underline') {
        const barHeight = Math.max(1, padding);
        baseGeom = new THREE.BoxGeometry(bgResult.width + padding, barHeight, bDepth);
        const baseMesh = new THREE.Mesh(baseGeom, baseMaterial);
        baseMesh.position.y = -bgResult.height / 2 - barHeight / 2 + bOffsetY;
        baseMesh.position.z = bgDepth / 2 + bOffsetZ;
        sceneManager.addToModel(baseMesh);
      } else if (ui.bgBase.value === 'plate') {
        baseGeom = new THREE.BoxGeometry(bgResult.width + padding, bgResult.height + padding, bDepth);
        const baseMesh = new THREE.Mesh(baseGeom, baseMaterial);
        baseMesh.position.y = bOffsetY;
        baseMesh.position.z = -bDepth / 2 + bOffsetZ; 
        sceneManager.addToModel(baseMesh);
      }
    }
    
    // Create Foreground Text
    if (fgTextStr && fgFont) {
      const fgResult = createTextMesh(fgTextStr, fgFont, fgSize, fgSpacing, fgDepth, 0xffffff, false, accentOffsetVal);
      fgResult.group.position.z = bgDepth - 0.5;
      fgResult.group.position.x += fgOffsetX;
      fgResult.group.position.y += fgOffsetY;
      sceneManager.addToModel(fgResult.group);
    }
    
    // Add Decoration
    const decoType = ui.decoShape.value;
    if (decoType !== 'none') {
      const decoGroup = createDecoration(decoType, fgDepth);
      const decoScale = parseFloat(ui.decoSize.value) / 30;
      decoGroup.scale.set(decoScale, decoScale, 1);
      
      const dOffsetX = parseFloat(ui.decoOffsetX.value);
      const dOffsetY = parseFloat(ui.decoOffsetY.value);
      
      decoGroup.position.x = bgResult.width / 2 + 15 + dOffsetX;
      decoGroup.position.y = dOffsetY;
      decoGroup.position.z = bgDepth - 0.5;
      sceneManager.addToModel(decoGroup);
    }
    
    ui.loading.classList.add('hidden');
  } catch (error) {
    console.error("Error generating model:", error);
    ui.loading.classList.add('hidden');
    alert("Error loading font. Try another one.");
  }
}

const debouncedGenerate = debounce(generateModel, 300);

// Setup Listeners
ui.btnExport.addEventListener('click', () => exportSTL(sceneManager.getModel(), '3d-text-mixer.stl'));

const activeInputs = [
  'bgText', 'bgSize', 'bgSpacing', 'bgDepth', 'fgText', 'fgSize', 'fgSpacing', 
  'fgDepth', 'fgOffsetX', 'fgOffsetY', 'basePadding', 'baseDepth', 'baseOffsetY', 
  'baseOffsetZ', 'accentOffset', 'decoSize', 'decoOffsetX', 'decoOffsetY'
];

activeInputs.forEach(key => {
  if(ui[key]) ui[key].addEventListener('input', debouncedGenerate);
});

ui.decoShape.addEventListener('change', (e) => {
  if (ui.decoSettings) {
    ui.decoSettings.style.display = e.target.value === 'none' ? 'none' : 'flex';
  }
  generateModel();
});

ui.bgBase.addEventListener('change', (e) => {
  ui.baseSettings.style.display = e.target.value === 'none' ? 'none' : 'flex';
  generateModel();
});

// Sync range sliders with number inputs
document.querySelectorAll('.slider-group').forEach(group => {
  const range = group.querySelector('input[type="range"]');
  const num = group.querySelector('input[type="number"]');
  
  if (range && num) {
    range.addEventListener('input', (e) => num.value = e.target.value);
    num.addEventListener('input', (e) => {
      range.value = e.target.value;
      debouncedGenerate();
    });
  }
});

// Setup UI
setupCustomDropdown('bg', BLOCK_FONTS, state, generateModel);
setupCustomDropdown('fg', CURSIVE_FONTS, state, generateModel);
initGlobalDropdownListeners();

// Initial Run
generateModel();

// Mobile Tabs Logic
function setupMobileTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.controls-container > .control-group');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      
      // If it's the export button, trigger export directly
      if (targetId === 'export-section') {
        exportSTL(sceneManager.getModel(), '3d-text-mixer.stl');
        return;
      }

      // Update active button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active section
      sections.forEach(sec => {
        sec.classList.remove('active');
        if (sec.id === targetId) {
          sec.classList.add('active');
          if (sec.tagName === 'DETAILS') sec.open = true;
        }
      });
      
      const container = document.querySelector('.controls-container');
      if (container) container.scrollTop = 0;

      // Update zoom slider default if needed (optional)
      
      // Trigger resize to recenter 3D model in the visualization area
      window.dispatchEvent(new Event('resize'));
    });
  });

  // Zoom Slider Connection
  const zoomSlider = document.getElementById('mobile-zoom');
  if (zoomSlider) {
    // Invert slider mapping so that decreasing the slider value moves the camera
    // further away (reduces apparent text size). This matches user expectation
    // that "zoom down" should make the scene appear smaller.
    zoomSlider.addEventListener('input', (e) => {
      const raw = parseInt(e.target.value, 10);
      const min = parseInt(zoomSlider.min, 10) || 50;
      const max = parseInt(zoomSlider.max, 10) || 600;
      const mapped = max + min - raw; // invert within same range
      sceneManager.setCameraDistance(mapped);
    });
  }

  if (ui.btnExport) {
    ui.btnExport.addEventListener('click', () => {
      console.log('Export button clicked');
      try {
        exportSTL(sceneManager.getModel(), '3d-text-mixer.stl');
      } catch (err) {
        console.error('Export failed:', err);
      }
    });
  } else {
    console.warn('Export button (#btn-export) not found in DOM');
  }
}

setupMobileTabs();

// Initialize first tab explicitly on load
const firstTab = document.querySelector('.tab-btn.active');
if (firstTab) firstTab.click();

// Accordion Auto-close logic (exclusive behavior)
const accordions = document.querySelectorAll('details.accordion');
accordions.forEach(target => {
  target.addEventListener('toggle', () => {
    if (target.open) {
      // On desktop (sidebar visible as lateral), close others
      // On mobile, they are already isolated by tabs, but keep it for consistency
      accordions.forEach(other => {
        if (other !== target) other.open = false;
      });
    }
  });
});
