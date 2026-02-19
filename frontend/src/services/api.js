import axios from 'axios';

// Base URL de l'API depuis les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Créer une instance Axios avec configuration de base
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide - déconnecter l'utilisateur
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================

export const authAPI = {
  // Inscription
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Récupérer le profil utilisateur
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Récupérer l'utilisateur depuis le localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Modifier le mot de passe (connecté)
  changePassword: async (data) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  // Mot de passe oublié - envoyer l'email
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Réinitialiser le mot de passe avec le token
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// ==================== CATEGORIES ====================

export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getAllAdmin: async () => {
    const response = await api.get('/categories/admin/all');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  reorder: async (items) => {
    const response = await api.put('/categories/reorder', { items });
    return response.data;
  },
};

// ==================== PRODUCTS ====================

export const productsAPI = {
  // Récupérer tous les produits actifs (public)
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // Récupérer un produit par ID (public)
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Récupérer tous les produits (admin)
  getAllAdmin: async () => {
    const response = await api.get('/products/admin/all');
    return response.data;
  },

  // Créer un produit (admin)
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Mettre à jour un produit (admin)
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Supprimer (désactiver) un produit (admin)
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Réordonner les produits (admin)
  reorder: async (items) => {
    const response = await api.put('/products/reorder', { items });
    return response.data;
  },
};

// ==================== DESIGNS ====================

export const designsAPI = {
  // Sauvegarder un design (user)
  save: async (designData) => {
    const response = await api.post('/designs', designData);
    return response.data;
  },

  // Récupérer les designs de l'utilisateur
  getMy: async () => {
    const response = await api.get('/designs');
    return response.data;
  },

  // Récupérer un design par ID
  getById: async (id) => {
    const response = await api.get(`/designs/${id}`);
    return response.data;
  },

  // Mettre à jour un design
  update: async (id, designData) => {
    const response = await api.put(`/designs/${id}`, designData);
    return response.data;
  },

  // Supprimer un design
  delete: async (id) => {
    const response = await api.delete(`/designs/${id}`);
    return response.data;
  },
};

// ==================== ORDERS ====================

export const ordersAPI = {
  // Créer une commande
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Récupérer les commandes de l'utilisateur
  getMy: async () => {
    const response = await api.get('/orders/my');
    return response.data;
  },

  // Récupérer une commande par ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Récupérer toutes les commandes (admin)
  getAllAdmin: async () => {
    const response = await api.get('/orders/admin/all');
    return response.data;
  },

  // Mettre à jour le statut d'une commande (admin)
  updateStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
};

// ==================== UPLOAD ====================

export const uploadAPI = {
  // Upload d'image produit (admin)
  uploadProductImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload d'image design (utilisateur)
  uploadDesignImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/design', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Supprimer une image (admin)
  deleteImage: async (publicId) => {
    const response = await api.delete('/upload/delete', {
      data: { publicId },
    });
    return response.data;
  },
};

// ==================== STRIPE ====================

export const stripeAPI = {
  // Creer une session de paiement Stripe
  createCheckoutSession: async (orderId, shippingInfo) => {
    const response = await api.post('/stripe/create-checkout-session', {
      orderId,
      shippingInfo
    });
    return response.data;
  },

  // Verifier le statut d'un paiement
  verifyPayment: async (sessionId, orderId) => {
    const response = await api.get(`/stripe/verify-payment?sessionId=${sessionId}&orderId=${orderId}`);
    return response.data;
  },
};

// Export de l'instance axios pour des requêtes personnalisées si nécessaire
export default api;
