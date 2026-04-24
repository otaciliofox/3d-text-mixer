/**
 * Sets up custom dropdowns for font selection with search capabilities.
 * 
 * @param {string} type Prefix (e.g., 'bg' or 'fg')
 * @param {string[]} fontList Array of font names
 * @param {Object} state Application state object
 * @param {Function} onChange Callback triggered on selection
 */
export function setupCustomDropdown(type, fontList, state, onChange) {
  const trigger = document.getElementById(`${type}-font-trigger`);
  const triggerText = trigger.querySelector('span');
  const dropdown = document.getElementById(`${type}-font-dropdown`);
  const searchInput = document.getElementById(`${type}-font-search`);
  const optionsContainer = document.getElementById(`${type}-font-options`);
  
  // Load Google Fonts CSS to style the previews
  const fontFamilies = fontList.map(f => f.replace(/ /g, '+')).join('&family=');
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies}&text=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  
  function renderOptions(filterText = '') {
    optionsContainer.innerHTML = '';
    const filtered = fontList.filter(f => f.toLowerCase().includes(filterText.toLowerCase()));
    filtered.forEach(font => {
      const div = document.createElement('div');
      div.className = 'custom-option';
      div.style.fontFamily = `"${font}", sans-serif`;
      div.innerText = font;
      div.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerText.innerText = font;
        state[`${type}Font`] = font;
        dropdown.classList.add('hidden');
        onChange();
      });
      optionsContainer.appendChild(div);
    });
  }
  
  renderOptions();
  
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = dropdown.classList.contains('hidden');
    // Hide all dropdowns
    document.querySelectorAll('.custom-options-container').forEach(el => el.classList.add('hidden'));
    
    if (isHidden) {
      dropdown.classList.remove('hidden');
      searchInput.value = '';
      renderOptions();
      searchInput.focus();
    }
  });
  
  searchInput.addEventListener('click', (e) => e.stopPropagation());
  
  searchInput.addEventListener('input', (e) => {
    renderOptions(e.target.value);
  });
}

/**
 * Initializes global click listener to close dropdowns.
 */
export function initGlobalDropdownListeners() {
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-options-container').forEach(el => el.classList.add('hidden'));
  });
}
