/**
 * Client Branding Utilities
 * Arwa Enterprises - Pharmacy Management System
 * 
 * Handles client-specific branding (name, logo, colors)
 */

// Storage keys
const STORAGE_KEYS = {
  CLIENT_ID: 'pms_client_id',
  CLIENT_CODE: 'pms_client_code',
  CLIENT_NAME: 'pms_client_name',
  CLIENT_NAME_AR: 'pms_client_name_ar',
  CLIENT_LOGO: 'pms_client_logo',
  SUBSCRIPTION_TIER: 'pms_subscription_tier',
  SUBSCRIPTION_STATUS: 'pms_subscription_status',
  SUBSCRIPTION_END: 'pms_subscription_end'
};

/**
 * Store client info after login
 * @param {Object} clientData - Client data from login response
 */
export function setClientInfo(clientData) {
  if (!clientData) return;

  localStorage.setItem(STORAGE_KEYS.CLIENT_ID, clientData.id || '');
  localStorage.setItem(STORAGE_KEYS.CLIENT_CODE, clientData.client_code || '');
  localStorage.setItem(STORAGE_KEYS.CLIENT_NAME, clientData.business_name || '');
  localStorage.setItem(STORAGE_KEYS.CLIENT_NAME_AR, clientData.business_name_ar || '');
  localStorage.setItem(STORAGE_KEYS.CLIENT_LOGO, clientData.logo_url || '');
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_TIER, clientData.subscription_tier || 'basic');
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, clientData.subscription_status || 'trial');
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_END, clientData.subscription_end_date || '');
}

/**
 * Get all client info
 * @returns {Object} - Client info object
 */
export function getClientInfo() {
  return {
    id: localStorage.getItem(STORAGE_KEYS.CLIENT_ID) || '',
    code: localStorage.getItem(STORAGE_KEYS.CLIENT_CODE) || '',
    name: localStorage.getItem(STORAGE_KEYS.CLIENT_NAME) || 'Pharmacy',
    nameAr: localStorage.getItem(STORAGE_KEYS.CLIENT_NAME_AR) || '',
    logo: localStorage.getItem(STORAGE_KEYS.CLIENT_LOGO) || '',
    tier: localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_TIER) || 'basic',
    status: localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_STATUS) || 'trial',
    subscriptionEnd: localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_END) || ''
  };
}

/**
 * Get client ID for API calls
 * @returns {string} - Client UUID
 */
export function getClientId() {
  return localStorage.getItem(STORAGE_KEYS.CLIENT_ID) || '';
}

/**
 * Get client code (AE1, AE2, etc.)
 * @returns {string} - Client code
 */
export function getClientCode() {
  return localStorage.getItem(STORAGE_KEYS.CLIENT_CODE) || '';
}

/**
 * Get client name
 * @returns {string} - Client business name
 */
export function getClientName() {
  return localStorage.getItem(STORAGE_KEYS.CLIENT_NAME) || 'Pharmacy';
}

/**
 * Get client logo URL
 * @returns {string} - Logo URL or empty string
 */
export function getClientLogo() {
  return localStorage.getItem(STORAGE_KEYS.CLIENT_LOGO) || '';
}

/**
 * Get subscription tier
 * @returns {string} - Tier (basic/standard/premium)
 */
export function getSubscriptionTier() {
  return localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_TIER) || 'basic';
}

/**
 * Clear all client info (on logout)
 */
export function clearClientInfo() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Display client branding on page load
 * Looks for elements with specific IDs and updates them
 */
export function displayClientBranding() {
  const clientInfo = getClientInfo();

  // Update company name element
  const nameElement = document.getElementById('company-name');
  if (nameElement) {
    nameElement.textContent = clientInfo.name;
  }

  // Update company logo element
  const logoElement = document.getElementById('company-logo');
  if (logoElement && clientInfo.logo) {
    logoElement.src = clientInfo.logo;
    logoElement.alt = clientInfo.name;
    logoElement.style.display = 'inline-block';
  }

  // Update page title
  document.title = `${clientInfo.name} - MediFlow PMS`;
}

/**
 * Check subscription status and show warning if expiring soon
 * @returns {Object} - Subscription status info
 */
export function checkSubscriptionStatus() {
  const clientInfo = getClientInfo();
  const result = {
    isActive: true,
    isExpiringSoon: false,
    daysLeft: null,
    message: '',
    tier: clientInfo.tier,
    status: clientInfo.status
  };

  // Check if expired or trial
  if (clientInfo.status === 'expired') {
    result.isActive = false;
    result.message = 'Your subscription has expired. Contact Arwa Enterprises to renew: +91 7021229209';
    return result;
  }

  // Check expiry date
  if (clientInfo.subscriptionEnd) {
    const endDate = new Date(clientInfo.subscriptionEnd);
    const today = new Date();
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    result.daysLeft = daysLeft;

    if (daysLeft <= 0) {
      result.isActive = false;
      result.message = 'Your subscription has expired. Contact Arwa Enterprises to renew: +91 7021229209';
    } else if (daysLeft <= 7) {
      result.isExpiringSoon = true;
      result.message = `Your subscription expires in ${daysLeft} day(s). Contact Arwa Enterprises to renew: +91 7021229209`;
    } else if (daysLeft <= 30) {
      result.isExpiringSoon = true;
      result.message = `Your subscription expires in ${daysLeft} days.`;
    }
  }

  return result;
}

/**
 * Display subscription warning banner if needed
 */
export function displaySubscriptionWarning() {
  const status = checkSubscriptionStatus();

  // Remove existing warning if any
  const existingWarning = document.getElementById('subscription-warning');
  if (existingWarning) {
    existingWarning.remove();
  }

  // Show warning if needed
  if (!status.isActive || status.isExpiringSoon) {
    const warningDiv = document.createElement('div');
    warningDiv.id = 'subscription-warning';
    warningDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding: 10px 20px;
      text-align: center;
      font-size: 14px;
      z-index: 9999;
      background: ${status.isActive ? '#FEF3C7' : '#FEE2E2'};
      color: ${status.isActive ? '#92400E' : '#991B1B'};
      border-bottom: 1px solid ${status.isActive ? '#F59E0B' : '#EF4444'};
    `;
    warningDiv.innerHTML = `
      <strong>${status.isActive ? '⚠️' : '🚫'}</strong> ${status.message}
      <a href="tel:+917021229209" style="margin-left: 10px; color: inherit; text-decoration: underline;">
        Call Now
      </a>
    `;

    document.body.prepend(warningDiv);
  }
}

/**
 * Get branding for export reports
 * @returns {Object} - Company info for exports
 */
export function getExportBranding() {
  const clientInfo = getClientInfo();
  return {
    name: clientInfo.name,
    logo: clientInfo.logo,
    footer: 'Powered by Arwa Enterprises - MediFlow PMS'
  };
}

/**
 * React hook-friendly function to get client info
 * Use in React components: const clientInfo = useClientInfo();
 */
export function useClientInfo() {
  return getClientInfo();
}

export default {
  setClientInfo,
  getClientInfo,
  getClientId,
  getClientCode,
  getClientName,
  getClientLogo,
  getSubscriptionTier,
  clearClientInfo,
  displayClientBranding,
  checkSubscriptionStatus,
  displaySubscriptionWarning,
  getExportBranding,
  useClientInfo
};
