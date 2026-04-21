export const validators = {
  email: (value: string) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
    return null;
  },
  password: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return null;
  },
  confirmPassword: (value: string, original: string) => {
    if (!value) return 'Please confirm your password';
    if (value !== original) return 'Passwords do not match';
    return null;
  },
  name: (value: string) => {
    if (!value.trim()) return 'Full name is required';
    return null;
  },
};
