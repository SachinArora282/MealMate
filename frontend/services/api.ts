import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach JWT token from storage on each request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mealmate_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Dish {
  id: string;
  name: string;
  price: number;
  dietType: 'VEG' | 'NON_VEG' | 'BOTH';
  description?: string;
  rating: number;
  popularityScore: number;
  tags: string[];
  imageUrl?: string;
  mealType: string;
  restaurantId: string;
  restaurant?: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    verified: boolean;
    imageUrl?: string;
  };
  _score?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  avgPrice: number;
  rating: number;
  verified: boolean;
  imageUrl?: string;
  description?: string;
  openingHours?: string;
  priceRange?: string;
  sourceUrl?: string;
  dishes?: Dish[];
  _count?: { dishes: number; reviews: number };
}

export interface Stats {
  totalRestaurants: number;
  totalDishes: number;
  totalUsers: number;
  avgPrice: number;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export const getStats = (): Promise<Stats> =>
  api.get('/stats').then(r => r.data);

export const getTrendingDishes = (): Promise<Dish[]> =>
  api.get('/dishes/trending').then(r => r.data);

export const getDishes = (params?: Record<string, string>): Promise<{ dishes: Dish[]; pagination: any }> =>
  api.get('/dishes', { params }).then(r => r.data);

export const getDishById = (id: string): Promise<Dish> =>
  api.get(`/dishes/${id}`).then(r => r.data);

export const getRestaurants = (params?: Record<string, string>): Promise<{ restaurants: Restaurant[] }> =>
  api.get('/restaurants', { params }).then(r => r.data);

// Neighbourhood-scoped dish search — used for "Near WE School" section
export const getNearbyDishes = (area: string): Promise<{ dishes: Dish[] }> =>
  api.get('/dishes', { params: { search: area, limit: '6' } }).then(r => r.data);

export const getRestaurantById = (id: string): Promise<Restaurant> =>
  api.get(`/restaurants/${id}`).then(r => r.data);

export const getRecommendations = (params: {
  maxBudget?: number;
  minBudget?: number;
  mealType?: string;
  dietType?: string;
  lat?: number;
  lng?: number;
}): Promise<{ recommendations: Dish[]; total: number }> =>
  api.get('/recommendations', { params }).then(r => r.data);

export const getSavedDishes = (): Promise<Dish[]> =>
  api.get('/saved').then(r => r.data);

export const saveDish = (dishId: string) =>
  api.post('/saved', { dishId }).then(r => r.data);

export const unsaveDish = (dishId: string) =>
  api.delete(`/saved/${dishId}`).then(r => r.data);

export const createRestaurant = (data: any) =>
  api.post('/restaurants', data).then(r => r.data);

export const uploadMenu = (formData: FormData) =>
  api.post('/uploads/menu', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const createDish = (data: any) =>
  api.post('/dishes', data).then(r => r.data);

export const getAdminStats = () =>
  api.get('/admin/stats').then(r => r.data);

export const approveRestaurant = (id: string) =>
  api.patch(`/admin/restaurants/${id}/approve`).then(r => r.data);

export const rejectRestaurant = (id: string, adminNote?: string) =>
  api.patch(`/admin/restaurants/${id}/reject`, { adminNote }).then(r => r.data);

export const getAdminRestaurants = (params?: Record<string, string>) =>
  api.get('/admin/restaurants', { params }).then(r => r.data);

export const authLogin = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then(r => r.data);

export const authRegister = (name: string, email: string, password: string, role?: string) =>
  api.post('/auth/register', { name, email, password, role }).then(r => r.data);

export default api;
