import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fridge items API
export const fridgeAPI = {
  // Get all items in fridge
  getItems: () => api.get('/fridge/items'),

  // Add new item to fridge
  addItem: (itemData) => api.post('/fridge/items', itemData),

  // Remove item from fridge
  removeItem: (itemId) => api.delete(`/fridge/items/${itemId}`),

  // Update item expiry
  updateItem: (itemId, data) => api.put(`/fridge/items/${itemId}`, data),
};

// Barcode scanning API
export const barcodeAPI = {
  // Scan barcode and get product info
  scanBarcode: (barcode) => api.get(`/getfood?barcode=${barcode}`),
};

// Shopping list API
export const shoppingListAPI = {
  // Get shopping list
  getItems: () => api.get('/shopping-list'),

  // Add item to shopping list
  addItem: (itemData) => api.post('/shopping-list', itemData),

  // Update item (check/uncheck)
  updateItem: (itemId, data) => api.put(`/shopping-list/${itemId}`, data),

  // Remove item from shopping list
  removeItem: (itemId) => api.delete(`/shopping-list/${itemId}`),
};

// Image/Video upload API
export const uploadAPI = {
  // Upload image/video for food parsing
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/parse-food', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Meal prep recommendations API
export const mealPrepAPI = {
  // Get meal suggestions based on fridge contents
  getRecommendations: () => api.get('/meal-prep/recommendations'),

  // Get specific meal suggestions for items
  getSuggestionsForItems: (itemIds) => api.post('/meal-prep/suggestions', { itemIds }),
};

export default api;
