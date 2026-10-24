import api from './api';

export const itemService = {
  // Fetch items with query params (search, category, condition, pricingType, page, limit)
  getItems: async (params = {}) => {
    const { data } = await api.get('/items', { params });
    return data;
  },

  // Fetch single item by ID
  getItemById: async (id) => {
    const { data } = await api.get(`/items/${id}`);
    return data;
  },

  // Fetch items listed by current user
  getMyListings: async () => {
    const { data } = await api.get('/items/user/my-listings');
    return data;
  },

  // Create new item listing (supports FormData for images or JSON)
  createItem: async (formData) => {
    const headers =
      formData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

    const { data } = await api.post('/items', formData, { headers });
    return data;
  },

  // Update existing item
  updateItem: async (id, updateData) => {
    const { data } = await api.put(`/items/${id}`, updateData);
    return data;
  },

  // Delete item listing
  deleteItem: async (id) => {
    const { data } = await api.delete(`/items/${id}`);
    return data;
  },
};

export default itemService;
