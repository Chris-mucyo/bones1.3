export type UserRole = 'BUYER' | 'SELLER' | 'WHOLESALER';

export interface SignupForm {
  // Step 1
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;

  // Step 2
  role: UserRole | '';
  shoppingFrequency: string;
  budget: string;
  experienceLevel: string;
  productType: string;

  // Step 3 - seller/wholesaler extras
  shopName: string;
  nationalId: string;
  shopDescription: string;
  shopAddress: string;
  productTypes: string[];
  categories: string[];

  // Step 3 - buyer
  interests: string[];

  // Step 4
  profileImage: File | null;
  profilePreview: string | null;
}

export const INITIAL_FORM: SignupForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
  role: '',
  shoppingFrequency: '',
  budget: '',
  experienceLevel: '',
  productType: '',
  shopName: '',
  nationalId: '',
  shopDescription: '',
  shopAddress: '',
  productTypes: [],
  categories: [],
  interests: [],
  profileImage: null,
  profilePreview: null,
};

export const WIZARD_STEPS = [
  { id: 1, label: 'Account' },
  { id: 2, label: 'Role'    },
  { id: 3, label: 'Setup'   },
  { id: 4, label: 'Photo'   },
  { id: 5, label: 'Review'  },
];

export const CATEGORY_DATA: { name: string; icon: string }[] = [
  { name: 'Electronics',       icon: '📱' },
  { name: 'Fashion',           icon: '👗' },
  { name: 'Food & Beverages',  icon: '🍔' },
  { name: 'Home & Garden',     icon: '🏡' },
  { name: 'Sports',            icon: '⚽' },
  { name: 'Beauty',            icon: '💄' },
  { name: 'Automotive',        icon: '🚗' },
  { name: 'Books',             icon: '📚' },
  { name: 'Toys',              icon: '🧸' },
  { name: 'Health',            icon: '💊' },
  { name: 'Music',             icon: '🎵' },
  { name: 'Art & Crafts',      icon: '🎨' },
  { name: 'Jewelry',           icon: '💍' },
  { name: 'Office Supplies',   icon: '🖊️' },
  { name: 'Agriculture',       icon: '🌱' },
  { name: 'Construction',      icon: '🏗️' },
];