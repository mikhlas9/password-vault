'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import PasswordGenerator from '../components/PasswordGenerator';
import VaultItem from '../components/VaultItem';
import AddItemModal from '../components/AddItemModal';
import { clientDecrypt } from '../lib/encryption';


interface VaultItemType {
  _id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [vaultItems, setVaultItems] = useState<VaultItemType[]>([]);
  const [filteredItems, setFilteredItems] = useState<VaultItemType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchVaultItems();
    }
  }, [user, loading]);

  useEffect(() => {
    const filtered = vaultItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, vaultItems]);

  const fetchVaultItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vault', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const items = await response.json();
        setVaultItems(items);
      }
    } catch (error) {
      console.error('Error fetching vault items:', error);
    }
    setIsLoading(false);
  };

  const handleItemAdded = () => {
    fetchVaultItems();
    setIsAddModalOpen(false);
  };

  const handleItemDeleted = (itemId: string) => {
    setVaultItems(prev => prev.filter(item => item._id !== itemId));
  };

  const handleItemUpdated = (itemId: string, updatedItem: VaultItemType) => {
    setVaultItems(prev => prev.map(item => 
      item._id === itemId ? { ...item, ...updatedItem } : item
    ));
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Password Generator */}
          <div className="lg:col-span-1">
            <PasswordGenerator />
          </div>

          {/* Vault Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-400">Your Vault</h2>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search your vault..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {vaultItems.length === 0 ? 'No items in your vault yet.' : 'No items match your search.'}
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <VaultItem
                      key={item._id}
                      item={item}
                      onDelete={handleItemDeleted}
                      onUpdate={handleItemUpdated}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <AddItemModal
          onClose={() => setIsAddModalOpen(false)}
          onItemAdded={handleItemAdded}
        />
      )}
    </div>
  );
}
