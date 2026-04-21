export interface Listing {
  id:          string;
  title:       string;
  description: string;
  price:       number;
  currency:    'RWF' | 'USD';
  images:      string[];
  category:    string;
  condition:   'new' | 'used' | 'refurbished';
  location:    string;
  seller: {
    id:         string;
    name:       string;
    avatar:    string;
    shopName:  string;
    verified:   boolean;
    rating:  number;
    totalSales: number;
  };
  badge?:      'new' | 'hot' | 'featured' | null;
  views:       number;
  savedCount:  number;
  createdAt:   string;
}

export interface Category {
  id:    string;
  name:  string;
  count: number;
}

export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular';

export interface HomeFilters {
  category:  string;
  sort:      SortOption;
  search:    string;
  location:  string;
}
