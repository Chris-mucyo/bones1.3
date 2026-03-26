export type UserRole = 'buyer' | 'seller' | 'wholesaler';

export interface User {
  id:                string;
  fullName:          string;
  email:             string;
  role:              UserRole;
  avatar?:           string | null;
  shopName?:         string | null;
  nationalId?:       string | null;
  categories?:       string[];
  interests?:        string[];
  experienceLevel?:  string | null;
  productType?:      string | null;
  shoppingFrequency?: string | null;
  budgetRange?:      string | null;
  isVerified:        boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?:   T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items:      T[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export type Theme = 'dark' | 'light';
