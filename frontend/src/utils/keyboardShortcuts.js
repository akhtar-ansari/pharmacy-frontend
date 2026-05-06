/**
 * Keyboard Shortcuts Utility
 * Arwa Enterprises - Pharmacy Management System
 * 
 * Handles F1-F12 and other keyboard shortcuts for quick actions
 */

// Default shortcut mappings
const DEFAULT_SHORTCUTS = {
  // Function keys
  F1: { action: 'help', description: 'Open Help' },
  F2: { action: 'new-sale', description: 'New Sale / POS' },
  F3: { action: 'search', description: 'Search Medicine' },
  F4: { action: 'add-medicine', description: 'Add New Medicine' },
  F5: { action: 'refresh', description: 'Refresh Data' },
  F6: { action: 'stock-in', description: 'Stock IN' },
  F7: { action: 'reports', description: 'Open Reports' },
  F8: { action: 'print', description: 'Print Current' },
  F9: { action: 'calculator', description: 'Open Calculator' },
  F10: { action: 'settings', description: 'Settings' },
  F11: { action: 'fullscreen', description: 'Toggle Fullscreen' },
  F12: { action: 'logout', description: 'Logout' },

  // Ctrl + Key combinations
  'Ctrl+S': { action: 'save', description: 'Save' },
  'Ctrl+P': { action: 'print', description: 'Print' },
  'Ctrl+N': { action: 'new', description: 'New Item' },
  'Ctrl+F': { action: 'search', description: 'Search' },
  'Ctrl+E': { action: 'export', description: 'Export' },
  'Ctrl+B': { action: 'barcode', description: 'Scan Barcode' },

  // Alt + Key combinations
  'Alt+D': { action: 'dashboard', description: 'Go to Dashboard' },
  'Alt+M': { action: 'medicines', description: 'Go to Medicines' },
  'Alt+S': { action: 'stock', description: 'Go to Stock' },
  'Alt+P': { action: 'pos', description: 'Go to POS' },
  'Alt+R': { action: 'reports', description: 'Go to Reports' },

  // Escape
  Escape: { action: 'close-modal', description: 'Close Modal / Cancel' }
};

// Action handlers storage
let actionHandlers = {};

/**
 * Register a handler for a specific action
 * @param {string} action - Action name
 * @param {Function} handler - Handler function
 */
export function registerHandler(action, handler) {
  actionHandlers[action] = handler;
}

/**
 * Register multiple handlers at once
 * @param {Object} handlers - Object of {action: handler} pairs
 */
export function registerHandlers(handlers) {
  actionHandlers = { ...actionHandlers, ...handlers };
}

/**
 * Unregister a handler
 * @param {string} action - Action name to unregister
 */
export function unregisterHandler(action) {
  delete actionHandlers[action];
}

/**
 * Clear all handlers
 */
export function clearHandlers() {
  actionHandlers = {};
}

/**
 * Get key string from event
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {string} - Key string (e.g., "Ctrl+S", "F2")
 */
function getKeyString(event) {
  const parts = [];

  if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');

  // Get the key name
  let key = event.key;
  
  // Normalize key names
  if (key === ' ') key = 'Space';
  if (key.length === 1) key = key.toUpperCase();

  // Don't add modifier keys themselves
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    parts.push(key);
  }

  return parts.join('+');
}

/**
 * Handle keyboard event
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyDown(event) {
  // Don't trigger shortcuts when typing in inputs
  const activeElement = document.activeElement;
  const isTyping = activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.isContentEditable
  );

  // Allow certain shortcuts even when typing
  const allowedWhileTyping = ['Escape', 'F1', 'F5'];

  const keyString = getKeyString(event);
  const shortcut = DEFAULT_SHORTCUTS[keyString];

  if (!shortcut) return;

  // Check if we should process this shortcut
  if (isTyping && !allowedWhileTyping.includes(keyString)) {
    return;
  }

  // Check if we have a handler for this action
  const handler = actionHandlers[shortcut.action];
  
  if (handler) {
    event.preventDefault();
    handler(event);
  } else {
    // Handle built-in actions
    handleBuiltInAction(shortcut.action, event);
  }
}

/**
 * Handle built-in actions
 * @param {string} action - Action name
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleBuiltInAction(action, event) {
  switch (action) {
    case 'fullscreen':
      event.preventDefault();
      toggleFullscreen();
      break;

    case 'refresh':
      event.preventDefault();
      window.location.reload();
      break;

    case 'help':
      event.preventDefault();
      showShortcutsHelp();
      break;

    case 'close-modal':
      // Let the app handle this
      break;

    default:
      console.log(`Unhandled shortcut action: ${action}`);
  }
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Fullscreen error:', err);
    });
  } else {
    document.exitFullscreen();
  }
}

/**
 * Show shortcuts help modal
 */
function showShortcutsHelp() {
  // Remove existing modal
  const existing = document.getElementById('shortcuts-help-modal');
  if (existing) {
    existing.remove();
    return;
  }

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'shortcuts-help-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  `;

  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0; color: #1F2937;">⌨️ Keyboard Shortcuts</h2>
      <button onclick="document.getElementById('shortcuts-help-modal').remove()" 
              style="border: none; background: #F3F4F6; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 18px;">
        ✕
      </button>
    </div>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #F9FAFB;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #E5E7EB;">Key</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #E5E7EB;">Action</th>
        </tr>
      </thead>
      <tbody>
  `;

  // Group shortcuts by type
  const groups = {
    'Function Keys': {},
    'Ctrl + Key': {},
    'Alt + Key': {},
    'Other': {}
  };

  Object.entries(DEFAULT_SHORTCUTS).forEach(([key, value]) => {
    if (key.startsWith('F')) {
      groups['Function Keys'][key] = value;
    } else if (key.startsWith('Ctrl')) {
      groups['Ctrl + Key'][key] = value;
    } else if (key.startsWith('Alt')) {
      groups['Alt + Key'][key] = value;
    } else {
      groups['Other'][key] = value;
    }
  });

  Object.entries(groups).forEach(([groupName, shortcuts]) => {
    if (Object.keys(shortcuts).length === 0) return;

    html += `
      <tr>
        <td colspan="2" style="padding: 12px 12px 8px; font-weight: 600; color: #6B7280; font-size: 12px; text-transform: uppercase;">
          ${groupName}
        </td>
      </tr>
    `;

    Object.entries(shortcuts).forEach(([key, value]) => {
      html += `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #E5E7EB;">
            <kbd style="background: #F3F4F6; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 13px;">
              ${key}
            </kbd>
          </td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #E5E7EB; color: #374151;">
            ${value.description}
          </td>
        </tr>
      `;
    });
  });

  html += `
      </tbody>
    </table>
    <p style="margin-top: 16px; color: #9CA3AF; font-size: 12px; text-align: center;">
      Press F1 to toggle this help menu
    </p>
  `;

  content.innerHTML = html;
  modal.appendChild(content);

  // Close on click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  document.body.appendChild(modal);
}

/**
 * Initialize keyboard shortcuts
 * Call this once when the app starts
 */
export function initKeyboardShortcuts() {
  document.addEventListener('keydown', handleKeyDown);
  console.log('⌨️ Keyboard shortcuts initialized. Press F1 for help.');
}

/**
 * Cleanup keyboard shortcuts
 * Call this when the app unmounts
 */
export function cleanupKeyboardShortcuts() {
  document.removeEventListener('keydown', handleKeyDown);
  clearHandlers();
}

/**
 * Get all shortcuts with descriptions
 * @returns {Object} - All shortcuts
 */
export function getAllShortcuts() {
  return { ...DEFAULT_SHORTCUTS };
}

const keyboardShortcutsAPI = {
  initKeyboardShortcuts,
  cleanupKeyboardShortcuts,
  registerHandler,
  registerHandlers,
  unregisterHandler,
  clearHandlers,
  getAllShortcuts,
  showShortcutsHelp
};

export default keyboardShortcutsAPI;
