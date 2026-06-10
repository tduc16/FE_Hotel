'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Customer, UpdateProfilePayload } from '@/types/customer';
import { customerAuthService } from '@/services/customer-auth.service';

interface CustomerAuthContextValue {
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (customer: Customer, token: string) => void;
  logout: () => void;
  updateCustomer: (payload: UpdateProfilePayload) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khởi tạo từ localStorage khi mount
  useEffect(() => {
    const stored = customerAuthService.getStoredCustomer();
    const token = customerAuthService.getToken();
    if (stored && token) {
      setCustomer(stored);
      // Validate token bằng cách gọi /me
      customerAuthService.getMe()
        .then((fresh) => setCustomer(fresh))
        .catch(() => {
          // Token hết hạn -> logout
          customerAuthService.logout();
          setCustomer(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((customer: Customer | null | undefined, token: string | null | undefined) => {
    if (token) {
      localStorage.setItem('customer_token', token);
    }
    if (customer) {
      localStorage.setItem('customer_info', JSON.stringify(customer));
      setCustomer(customer);
    }
  }, []);

  const logout = useCallback(() => {
    customerAuthService.logout();
    setCustomer(null);
  }, []);

  const updateCustomer = useCallback(async (payload: UpdateProfilePayload) => {
    const updated = await customerAuthService.updateProfile(payload);
    setCustomer(updated);
  }, []);

  const refreshProfile = useCallback(async () => {
    const fresh = await customerAuthService.getMe();
    setCustomer(fresh);
    if (fresh) {
      localStorage.setItem('customer_info', JSON.stringify(fresh));
    }
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoading,
        isAuthenticated: !!customer,
        login,
        logout,
        updateCustomer,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error('useCustomerAuth phải được dùng trong CustomerAuthProvider');
  }
  return ctx;
}
