'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import PasswordGenerator from '../components/PasswordGenerator';
import VaultList from '../components/VaultList';
import { VaultItemDecrypted } from '../lib/types';

export default function Dashboard() {
  const [vaultItems, setVaultItems] = useState<VaultItemDecrypted[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadVaultItems();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/vault');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      // Extract user info from response or token
      const data = await response.json();
      console.log(data)
      // You may need to add user info to the API response
      setUser({ email: 'user@example.com' });
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const loadVaultItems = async () => {
    try {
      const response = await fetch('/api/vault');
      if (response.ok) {
        const data = await response.json();
        setVaultItems(data.items);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to load vault items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear the auth cookie by setting it to expire
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

 if (loading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Spinner */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-blue-200 animate-ping"></div>
        <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-transparent border-t-blue-600 border-r-indigo-500 animate-spin"></div>
      </div>

      {/* Text */}
      <p className="mt-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
        Loading your Vault...
      </p>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Password Vault</h1>
          <div className="flex items-center space-x-4">

            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center space-x-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <PasswordGenerator />
          </div>
          <div className="lg:col-span-2">
            <VaultList items={vaultItems} onItemsChange={loadVaultItems} />
          </div>
        </div>
      </main>
    </div>
  );
}