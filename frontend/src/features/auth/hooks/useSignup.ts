import { useState, useEffect } from 'react';
import type { SignupFormData, StepErrors, UserRole } from '../types/signup.types';
import { INITIAL_FORM } from '../types/signup.types';

const STORAGE_KEY = 'shophub_signup_form';

function saveToDraft(form: SignupFormData) {
  const { profileImage, profilePreview, ...rest } = form;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

function loadFromDraft(): Partial<SignupFormData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function useSignup() {
  const [form, setForm]               = useState<SignupFormData>({ ...INITIAL_FORM, ...loadFromDraft() });
  const [errors, setErrors]           = useState<StepErrors>({});
  const [loading, setLoading]         = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => { saveToDraft(form); }, [form]);

  const update = (patch: Partial<SignupFormData>) =>
    setForm(f => ({ ...f, ...patch }));

  const clearErrors = () => setErrors({});

  function validate(step: number): boolean {
    clearErrors();
    const e: StepErrors = {};

    if (step === 1) {
      if (!form.fullName.trim())
        e.fullName = 'Full name is required';
      if (!form.email.trim())
        e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = 'Enter a valid email address';
      if (!form.password || form.password.length < 8)
        e.password = 'Password must be at least 8 characters';
      if (form.password !== form.confirmPassword)
        e.confirmPassword = 'Passwords do not match';
      if (!form.terms)
        e.terms = 'You must agree to the terms to continue';
    }

    if (step === 2) {
      if (!form.role)
        e.role = 'Please select how you want to use ShopHub';
      if (form.role === 'buyer') {
        if (!form.shoppingFrequency) e.shoppingFrequency = 'Please select a frequency';
        if (!form.budgetRange)       e.budgetRange       = 'Please select a budget range';
      }
      if (form.role === 'seller' || form.role === 'wholesaler') {
        if (!form.experienceLevel) e.experienceLevel = 'Please select your experience level';
        if (!form.productType)     e.productType     = 'Please select a product type';
      }
    }

    if (step === 3) {
      if (form.role === 'seller' || form.role === 'wholesaler') {
        if (!form.shopName.trim())        e.shopName  = 'Shop name is required';
        if (!form.nationalId.trim())
        e.nationalId = 'National ID is required';
      else if (!/^1[0-9]{15}$/.test(form.nationalId.replace(/\s/g, '')))
        e.nationalId = 'Enter a valid 16-digit Rwanda National ID';
        if (form.categories.length === 0) e.categories = 'Select at least one category';
      }
      if (form.role === 'buyer') {
        if (form.interests.length === 0)  e.interests = 'Select at least one interest';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(): Promise<boolean> {
    setLoading(true);
    setServerError(null);
    try {
      const payload = new FormData();
      payload.append('fullName', form.fullName);
      payload.append('email',    form.email);
      payload.append('password', form.password);
      payload.append('role',     form.role);

      if (form.role === 'seller' || form.role === 'wholesaler') {
        payload.append('shopName',   form.shopName);
        payload.append('nationalId', form.nationalId);
        payload.append('categories', JSON.stringify(form.categories));
        if (form.experienceLevel) payload.append('experienceLevel', form.experienceLevel);
        if (form.productType)     payload.append('productType',     form.productType);
      } else {
        payload.append('interests', JSON.stringify(form.interests));
        if (form.shoppingFrequency) payload.append('shoppingFrequency', form.shoppingFrequency);
        if (form.budgetRange)       payload.append('budgetRange',       form.budgetRange);
      }

      if (form.profileImage) payload.append('profileImage', form.profileImage);

      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        body: payload,
      });

      if (!res.ok) {
        const data = await res.json();
        const detail = data.errors?.[0] ?? data.message ?? 'Registration failed';
        throw new Error(detail);
      }

      const data = await res.json();
      // Backend wraps response: { success, message, data: { user, accessToken, refreshToken } }
      const user = data.data?.user ?? data.user ?? null;
      if (user) localStorage.setItem('user', JSON.stringify(user));
      if (data.data?.accessToken)  localStorage.setItem('accessToken',  data.data.accessToken);
      if (data.data?.refreshToken) localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }

  function passwordStrength(pw: string) {
    let score = 0;
    if (pw.length >= 8)           score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw))  score++;
    const levels = [
      { label: 'Enter a password', color: 'transparent', width: '0%'   },
      { label: 'Weak',             color: '#ef4444',     width: '25%'  },
      { label: 'Fair',             color: '#f97316',     width: '50%'  },
      { label: 'Good',             color: '#eab308',     width: '75%'  },
      { label: 'Strong 💪',        color: '#22c55e',     width: '100%' },
    ];
    return { score, ...levels[score] };
  }

  function toggleList(key: 'categories' | 'interests', item: string, max = 5) {
    setForm(f => {
      const list = f[key] as string[];
      const has  = list.includes(item);
      if (!has && list.length >= max) return f;
      return { ...f, [key]: has ? list.filter(c => c !== item) : [...list, item] };
    });
  }

  function handleProfileImage(file: File) {
    update({ profileImage: file, profilePreview: URL.createObjectURL(file) });
  }

  return {
    form, errors, loading, serverError,
    update, validate, submit,
    passwordStrength, toggleList, handleProfileImage,
  };
}
