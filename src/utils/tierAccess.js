/**
 * Tier-based Module Access Control
 * Arwa Enterprises - Pharmacy Management System
 * 
 * Controls which modules are accessible based on subscription tier
 */

// Module definitions with tier requirements
export const PMS_MODULES = {
  // Basic Tier Modules (Always accessible)
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '🏠',
    path: '/dashboard',
    tier: 'basic',
    description: 'Overview and quick stats'
  },
  medicines: {
    id: 'medicines',
    name: 'Medicine Database',
    icon: '💊',
    path: '/medicines',
    tier: 'basic',
    description: 'Add/edit/delete medicines'
  },
  stockIn: {
    id: 'stockIn',
    name: 'Stock IN',
    icon: '📦',
    path: '/stock-in',
    tier: 'basic',
    description: 'Receive inventory'
  },
  pos: {
    id: 'pos',
    name: 'POS / Billing',
    icon: '🛒',
    path: '/pos',
    tier: 'basic',
    description: 'Customer checkout'
  },
  suppliers: {
    id: 'suppliers',
    name: 'Suppliers',
    icon: '🏭',
    path: '/suppliers',
    tier: 'basic',
    description: 'Manage suppliers'
  },

  // Standard Tier Modules
  expiryAlerts: {
    id: 'expiryAlerts',
    name: 'Expiry Alerts',
    icon: '⚠️',
    path: '/expiry-alerts',
    tier: 'standard',
    description: 'Track expiring medicines'
  },
  reorderAlerts: {
    id: 'reorderAlerts',
    name: 'Reorder Alerts',
    icon: '🔔',
    path: '/reorder-alerts',
    tier: 'standard',
    description: 'Low stock warnings'
  },
  payments: {
    id: 'payments',
    name: 'Payments',
    icon: '💰',
    path: '/payments',
    tier: 'standard',
    description: 'Payment tracking'
  },
  salesReports: {
    id: 'salesReports',
    name: 'Sales Reports',
    icon: '📊',
    path: '/sales-reports',
    tier: 'standard',
    description: 'Sales analysis'
  },

  // Premium Tier Modules
  businessInsights: {
    id: 'businessInsights',
    name: 'Business Insights',
    icon: '📈',
    path: '/business-insights',
    tier: 'premium',
    description: 'Charts & analytics'
  },
  barcode: {
    id: 'barcode',
    name: 'Barcode System',
    icon: '🏷️',
    path: '/barcode',
    tier: 'premium',
    description: 'Generate & scan barcodes'
  },
  userManagement: {
    id: 'userManagement',
    name: 'User Management',
    icon: '👥',
    path: '/users',
    tier: 'premium',
    description: 'Manage staff accounts'
  }
};

// Tier hierarchy (higher includes lower)
const TIER_HIERARCHY = {
  basic: 1,
  standard: 2,
  premium: 3
};

/**
 * Check if a module is accessible for a given tier
 * @param {string} moduleId - The module ID to check
 * @param {string} userTier - The user's subscription tier (basic/standard/premium)
 * @returns {boolean} - Whether the module is accessible
 */
export function canAccessModule(moduleId, userTier) {
  const module = PMS_MODULES[moduleId];
  if (!module) return false;

  const userTierLevel = TIER_HIERARCHY[userTier] || 0;
  const requiredTierLevel = TIER_HIERARCHY[module.tier] || 0;

  return userTierLevel >= requiredTierLevel;
}

/**
 * Get all accessible modules for a tier
 * @param {string} userTier - The user's subscription tier
 * @returns {Array} - Array of accessible module objects
 */
export function getAccessibleModules(userTier) {
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;

  return Object.values(PMS_MODULES).filter(module => {
    const requiredTierLevel = TIER_HIERARCHY[module.tier] || 0;
    return userTierLevel >= requiredTierLevel;
  });
}

/**
 * Get all modules with access status
 * @param {string} userTier - The user's subscription tier
 * @returns {Array} - Array of module objects with 'locked' property
 */
export function getAllModulesWithStatus(userTier) {
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;

  return Object.values(PMS_MODULES).map(module => {
    const requiredTierLevel = TIER_HIERARCHY[module.tier] || 0;
    return {
      ...module,
      locked: userTierLevel < requiredTierLevel,
      requiredTier: module.tier
    };
  });
}

/**
 * Get locked modules (for showing upgrade prompts)
 * @param {string} userTier - The user's subscription tier
 * @returns {Array} - Array of locked module objects
 */
export function getLockedModules(userTier) {
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;

  return Object.values(PMS_MODULES).filter(module => {
    const requiredTierLevel = TIER_HIERARCHY[module.tier] || 0;
    return userTierLevel < requiredTierLevel;
  });
}

/**
 * Get tier display info
 * @param {string} tier - The tier name
 * @returns {Object} - Tier display info (name, color, icon)
 */
export function getTierInfo(tier) {
  const tiers = {
    basic: {
      name: 'Basic',
      color: '#6B7280', // Gray
      bgColor: '#F3F4F6',
      icon: '⭐',
      price: '1,200 SAR/year'
    },
    standard: {
      name: 'Standard',
      color: '#3B82F6', // Blue
      bgColor: '#EFF6FF',
      icon: '⭐⭐',
      price: '1,800 SAR/year'
    },
    premium: {
      name: 'Premium',
      color: '#8B5CF6', // Purple
      bgColor: '#F5F3FF',
      icon: '⭐⭐⭐',
      price: '2,500 SAR/year'
    }
  };

  return tiers[tier] || tiers.basic;
}

/**
 * Get upgrade message for a locked module
 * @param {string} moduleId - The locked module ID
 * @param {string} currentTier - Current subscription tier
 * @returns {string} - Upgrade message
 */
export function getUpgradeMessage(moduleId, currentTier) {
  const module = PMS_MODULES[moduleId];
  if (!module) return '';

  const requiredTier = getTierInfo(module.tier);
  
  return `Upgrade to ${requiredTier.name} (${requiredTier.price}) to unlock ${module.name}. Contact: +91 7021229209`;
}

/**
 * Store tier in localStorage
 * @param {string} tier - The subscription tier
 */
export function setUserTier(tier) {
  localStorage.setItem('pms_subscription_tier', tier);
}

/**
 * Get tier from localStorage
 * @returns {string} - The subscription tier (defaults to 'basic')
 */
export function getUserTier() {
  return localStorage.getItem('pms_subscription_tier') || 'basic';
}

export default {
  PMS_MODULES,
  canAccessModule,
  getAccessibleModules,
  getAllModulesWithStatus,
  getLockedModules,
  getTierInfo,
  getUpgradeMessage,
  setUserTier,
  getUserTier
};
