export type UserRole = 'buyer' | 'seller' | 'wholesaler';

export interface SignupFormData {
  // Step 1 — Account
  fullName:        string;
  email:           string;
  password:        string;
  confirmPassword: string;
  terms:           boolean;

  // Step 2 — Personalise
  role:              UserRole | '';
  shoppingFrequency: string;
  budgetRange:       string;
  experienceLevel:   string;
  productType:       string;

  // Step 3 — Shop / Interests
  shopName:   string;
  nationalId: string;        // seller/wholesaler — used to look up TIN via RRA
  categories: string[];
  interests:  string[];

  // Step 4 — Profile photo
  profileImage:   File | null;
  profilePreview: string | null;
}

export type StepErrors = Partial<Record<keyof SignupFormData, string>>;

export interface WizardStep {
  id:    number;
  label: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, label: 'Account'   },
  { id: 2, label: 'About You' },
  { id: 3, label: 'Setup'     },
  { id: 4, label: 'Photo'     },
  { id: 5, label: 'Review'    },
];

export const CATEGORY_DATA = [
  { name: 'Fashion & Apparel',      icon: '👕' },
  { name: 'Electronics',            icon: '📱' },
  { name: 'Home & Living',          icon: '🏠' },
  { name: 'Beauty & Personal Care', icon: '💄' },
  { name: 'Food & Beverages',       icon: '🍔' },
  { name: 'Health & Wellness',      icon: '🧘' },
  { name: 'Phones & Accessories',   icon: '📲' },
  { name: 'Computers & Office',     icon: '💻' },
  { name: 'Books & Stationery',     icon: '📚' },
  { name: 'Music & Instruments',    icon: '🎸' },
  { name: 'Sports & Outdoors',      icon: '⚽' },
  { name: 'Wholesale & Bulk',       icon: '📦' },
];

export const INITIAL_FORM: SignupFormData = {
  fullName: '', email: '', password: '', confirmPassword: '', terms: false,
  role: '', shoppingFrequency: '', budgetRange: '',
  experienceLevel: '', productType: '',
  shopName: '', nationalId: '', categories: [], interests: [],
  profileImage: null, profilePreview: null,
};
