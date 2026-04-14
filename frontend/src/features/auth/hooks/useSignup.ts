import { useState, useCallback } from 'react';
import { INITIAL_FORM} from '../types/signup.types';
import type { SignupForm } from '../types/signup.types';

type Errors = Partial<Record<keyof SignupForm | 'budgetRange' | 'experienceLevel' | 'productType' | 'categories' | 'shopDescription' | 'shopAddress', string>>;

export function useSignup() {
  const [form, setForm]             = useState<SignupForm>(INITIAL_FORM);
  const [errors, setErrors]         = useState<Errors>({});
  const [loading, setLoading]       = useState(false);
  const [serverError, setServerError] = useState('');

  const update = useCallback((patch: Partial<SignupForm>) => {
    setForm(prev => ({ ...prev, ...patch }));
    setErrors(prev => {
      const next = { ...prev };
      (Object.keys(patch) as (keyof SignupForm)[]).forEach(k => delete next[k as keyof Errors]);
      return next;
    });
  }, []);

  const toggleList = useCallback(
    (field: 'categories' | 'interests' | 'productTypes', value: string, max: number) => {
      setForm(prev => {
        const list = prev[field] as string[];
        if (list.includes(value)) return { ...prev, [field]: list.filter(v => v !== value) };
        if (list.length >= max)   return prev;
        return { ...prev, [field]: [...list, value] };
      });
    },
    [],
  );

  const handleProfileImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => update({ profileImage: file, profilePreview: e.target?.result as string });
    reader.readAsDataURL(file);
  }, [update]);

  const passwordStrength = useCallback((pwd: string) => {
    if (!pwd)          return { width: '0%',   color: 'transparent', label: '' };
    if (pwd.length < 6) return { width: '25%',  color: '#ef4444',     label: 'Too short' };
    const hasUpper   = /[A-Z]/.test(pwd);
    const hasNumber  = /\d/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const score = [pwd.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score <= 1)  return { width: '40%',  color: '#f97316', label: 'Weak'   };
    if (score === 2) return { width: '65%',  color: '#eab308', label: 'Fair'   };
    if (score === 3) return { width: '80%',  color: '#84cc16', label: 'Good'   };
    return               { width: '100%', color: '#22c55e', label: 'Strong' };
  }, []);

  const validate = useCallback((step: number): boolean => {
    const e: Errors = {};

    if (step === 1) {
      if (!form.fullName.trim())                         e.fullName        = 'Full name is required';
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email        = 'Valid email required';
      if (form.password.length < 8)                      e.password        = 'Min. 8 characters';
      if (form.password !== form.confirmPassword)        e.confirmPassword = 'Passwords do not match';
      if (!form.terms)                                   e.terms           = 'You must accept the terms' as any;
    }

    if (step === 2) {
      if (!form.role)                  e.role = 'Please select a role';
      if (form.role === 'BUYER') {
        if (!form.shoppingFrequency)   e.shoppingFrequency = 'Required';
        if (!form.budget)              e.budget            = 'Required';
      }
      if (form.role === 'SELLER' || form.role === 'WHOLESALER') {
        if (!form.experienceLevel)     (e as any).experienceLevel = 'Required';
        if (!form.productType)         (e as any).productType     = 'Required';
      }
    }

    if (step === 3) {
      if (form.role === 'SELLER' || form.role === 'WHOLESALER') {
        if (!form.shopName.trim())    e.shopName    = 'Shop name is required';
        if (!form.nationalId.trim())  e.nationalId  = 'National ID is required';
        if (form.nationalId.length !== 16) e.nationalId = 'Must be 16 digits';
        if (form.categories.length === 0) (e as any).categories = 'Select at least one category';
      }
      if (form.role === 'BUYER') {
        if (form.interests.length === 0) e.interests = 'Select at least one interest' as any;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const submit = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setServerError('');

    try {
      const payload: Record<string, any> = {
        fullName:  form.fullName,
        email:     form.email,
        password:  form.password,
        role:      form.role.toUpperCase(),
      };

      if (form.role === 'BUYER') {
        payload.shoppingFrequency = form.shoppingFrequency;
        payload.budget            = form.budget;
        payload.interests         = form.interests;
      }

      if (form.role === 'SELLER' || form.role === 'WHOLESALER') {
        payload.shopName        = form.shopName;
        payload.nationalId      = form.nationalId;
        payload.shopDescription = form.shopDescription;
        payload.shopAddress     = form.shopAddress;
        payload.productTypes    = form.categories;
        payload.experience      = form.experienceLevel;
      }

      const res = await fetch('http://localhost:3000/api/v1/users/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(
          Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Registration failed',
        );
        return false;
      }

      return true;
    } catch {
      setServerError('Network error. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [form]);

  return {
    form, errors, loading, serverError,
    update, validate, submit,
    passwordStrength, toggleList, handleProfileImage,
  };
}