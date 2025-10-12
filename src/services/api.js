// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Generic API request handler
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Medicines API
export const medicinesAPI = {
  getAll: async () => {
    return await apiRequest('/medicines');
  },

  getById: async (id) => {
    return await apiRequest(`/medicines/${id}`);
  },

  create: async (medicineData) => {
    return await apiRequest('/medicines', {
      method: 'POST',
      body: JSON.stringify(medicineData),
    });
  },

  update: async (id, medicineData) => {
    return await apiRequest(`/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicineData),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/medicines/${id}`, {
      method: 'DELETE',
    });
  },
};

// Stock API (Legacy - single items)
export const stockAPI = {
  getAll: async () => {
    return await apiRequest('/stock');
  },

  create: async (stockData) => {
    return await apiRequest('/stock', {
      method: 'POST',
      body: JSON.stringify(stockData),
    });
  },

  update: async (id, stockData) => {
    return await apiRequest(`/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stockData),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/stock/${id}`, {
      method: 'DELETE',
    });
  },
};

// Stock Invoices API (NEW - multi-item invoices)
export const stockInvoicesAPI = {
  // Get all invoices
  getAll: async () => {
    return await apiRequest('/stock/invoices');
  },

  // Get single invoice with items
  getById: async (id) => {
    return await apiRequest(`/stock/invoices/${id}`);
  },

  // Create new invoice with multiple items
  create: async (invoiceData) => {
    return await apiRequest('/stock/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  },

  // Update invoice (payment status, notes)
  update: async (id, invoiceData) => {
    return await apiRequest(`/stock/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  },

  // Delete invoice and related stock
  delete: async (id) => {
    return await apiRequest(`/stock/invoices/${id}`, {
      method: 'DELETE',
    });
  },
};

// Suppliers API
export const suppliersAPI = {
  getAll: async () => {
    return await apiRequest('/suppliers');
  },

  getById: async (id) => {
    return await apiRequest(`/suppliers/${id}`);
  },

  create: async (supplierData) => {
    return await apiRequest('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  },

  update: async (id, supplierData) => {
    return await apiRequest(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Sales API
export const salesAPI = {
  getAll: async () => {
    return await apiRequest('/sales');
  },

  getById: async (id) => {
    return await apiRequest(`/sales/${id}`);
  },

  create: async (saleData) => {
    return await apiRequest('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/sales/${id}`, {
      method: 'DELETE',
    });
  },
};

// Payments API
export const paymentsAPI = {
  getAll: async () => {
    return await apiRequest('/payments');
  },

  create: async (paymentData) => {
    return await apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  update: async (id, paymentData) => {
    return await apiRequest(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/payments/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    return await apiRequest('/users');
  },

  create: async (userData) => {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id, userData) => {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id) => {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  login: async (credentials) => {
    return await apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};