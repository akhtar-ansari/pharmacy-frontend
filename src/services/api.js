// Base API URL - Change this when deploying
const API_BASE_URL = 'https://pharmacy-backend-3mwa.onrender.com/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
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
    console.error(`API Error (${endpoint}):`, error);
    return { success: false, error: error.message, data: [] };
  }
};

// ==================== MEDICINES API ====================
export const medicinesAPI = {
  getAll: async () => {
    try {
      const result = await apiCall('/medicines');
      return { success: result.success, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching medicines:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  create: async (medicine) => {
    try {
      const result = await apiCall('/medicines', {
        method: 'POST',
        body: JSON.stringify(medicine),
      });
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('Error creating medicine:', error);
      return { success: false, error: error.message };
    }
  },

  add: async (medicine) => {
    return await medicinesAPI.create(medicine);
  },

  update: async (id, medicine) => {
    try {
      const result = await apiCall(`/medicines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(medicine),
      });
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('Error updating medicine:', error);
      return { success: false, error: error.message };
    }
  },

  delete: async (id) => {
    try {
      const result = await apiCall(`/medicines/${id}`, {
        method: 'DELETE',
      });
      return { success: result.success };
    } catch (error) {
      console.error('Error deleting medicine:', error);
      return { success: false, error: error.message };
    }
  }
};

// ==================== STOCK API ====================
export const stockAPI = {
  getAll: async () => {
    try {
      const result = await apiCall('/stock');
      return { success: result.success, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching stock:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  create: async (stock) => {
    try {
      const result = await apiCall('/stock', {
        method: 'POST',
        body: JSON.stringify(stock),
      });
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('Error creating stock:', error);
      return { success: false, error: error.message };
    }
  },

  add: async (stock) => {
    return await stockAPI.create(stock);
  },

  update: async (id, stock) => {
    try {
      const result = await apiCall(`/stock/${id}`, {
        method: 'PUT',
        body: JSON.stringify(stock),
      });
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('Error updating stock:', error);
      return { success: false, error: error.message };
    }
  },

  delete: async (id) => {
    try {
      const result = await apiCall(`/stock/${id}`, {
        method: 'DELETE',
      });
      return { success: result.success };
    } catch (error) {
      console.error('Error deleting stock:', error);
      return { success: false, error: error.message };
    }
  }
};

// ==================== SALES API ====================
// ==================== SALES API ====================
export const salesAPI = {
  getAll: async () => {
    try {
      const result = await apiCall('/sales');
      return { success: result.success, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching sales:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  add: async (sale) => {
    try {
      const result = await apiCall('/sales', {
        method: 'POST',
        body: JSON.stringify(sale),
      });
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('Error adding sale:', error);
      return { success: false, error: error.message };
    }
  },

  delete: async (id) => {
    try {
      const result = await apiCall(`/sales/${id}`, {
        method: 'DELETE',
      });
      return { success: result.success };
    } catch (error) {
      console.error('Error deleting sale:', error);
      return { success: false, error: error.message };
    }
  }
};

// ==================== SUPPLIERS API ====================
export const suppliersAPI = {
  getAll: async () => {
    try {
      const result = await apiCall('/suppliers');
      return { success: result.success, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  create: async (supplier) => {
    try {
      const result = await apiCall('/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplier),
      });
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('Error creating supplier:', error);
      return { success: false, error: error.message };
    }
  },

  add: async (supplier) => {
    return await suppliersAPI.create(supplier);
  },

  update: async (id, supplier) => {
    try {
      const result = await apiCall(`/suppliers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(supplier),
      });
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('Error updating supplier:', error);
      return { success: false, error: error.message };
    }
  },

  delete: async (id) => {
    try {
      const result = await apiCall(`/suppliers/${id}`, {
        method: 'DELETE',
      });
      return { success: result.success };
    } catch (error) {
      console.error('Error deleting supplier:', error);
      return { success: false, error: error.message };
    }
  }
};

// ==================== PAYMENTS API ====================
export const paymentsAPI = {
  getAll: async () => {
    try {
      const result = await apiCall('/payments');
      return { success: result.success, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  create: async (payment) => {
    try {
      const result = await apiCall('/payments', {
        method: 'POST',
        body: JSON.stringify(payment),
      });
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('Error creating payment:', error);
      return { success: false, error: error.message };
    }
  },

  add: async (payment) => {
    return await paymentsAPI.create(payment);
  },

  update: async (id, payment) => {
    try {
      const result = await apiCall(`/payments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payment),
      });
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('Error updating payment:', error);
      return { success: false, error: error.message };
    }
  },

  delete: async (id) => {
    try {
      const result = await apiCall(`/payments/${id}`, {
        method: 'DELETE',
      });
      return { success: result.success };
    } catch (error) {
      console.error('Error deleting payment:', error);
      return { success: false, error: error.message };
    }
  }
};

// ==================== USERS API ====================
export const usersAPI = {
  getAll: async () => {
    try {
      const result = await apiCall('/users');
      return { success: result.success, data: result.data || [] };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  create: async (user) => {
    try {
      const result = await apiCall('/users/register', {
        method: 'POST',
        body: JSON.stringify(user),
      });
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  },

  update: async (id, user) => {
    try {
      const result = await apiCall(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(user),
      });
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  },

  delete: async (id) => {
    try {
      const result = await apiCall(`/users/${id}`, {
        method: 'DELETE',
      });
      return { success: result.success };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
  }
};