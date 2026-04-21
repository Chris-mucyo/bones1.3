export interface ListingFormData {
  title:       string;
  description: string;
  price:       string;
  currency:    'RWF' | 'USD';
  category:    string;
  condition:   'new' | 'used' | 'refurbished';
  location:    string;
  images:      File[];
  previews:    string[];
}

export const LISTING_CATEGORIES = [
  'Electronics',
  'Fashion & Apparel',
  'Home & Living',
  'Beauty & Personal Care',
  'Food & Beverages',
  'Health & Wellness',
  'Phones & Accessories',
  'Computers & Office',
  'Books & Stationery',
  'Music & Instruments',
  'Sports & Outdoors',
  'Wholesale & Bulk',
  'Other',
] as const;

export const LISTING_CONDITIONS = [
  { value: 'new',         label: 'Brand New'    },
  { value: 'used',        label: 'Used'         },
  { value: 'refurbished', label: 'Refurbished'  },
] as const;

export const INITIAL_LISTING_FORM: ListingFormData = {
  title: '', description: '', price: '', currency: 'RWF',
  category: '', condition: 'new', location: '',
  images: [], previews: [],
};
