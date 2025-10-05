'use client';

import { useState, useEffect } from 'react';
import { clientDecrypt } from '../lib/encryption';

interface VaultItemProps {
  item: {
    _id: string;
    title: string;
    username: string;
    password: string;
    url: string;
    notes: string;
    createdAt: string;
  };
  onDelete: (itemId: string) => void;
  onUpdate: (itemId: string, updatedItem: any) => void;
}

export default function VaultItem({ item, onDelete, onUpdate }: VaultItemProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState('');
  const [decryptedNotes, setDecryptedNotes] = useState('');
  const [copyTimeout, setCopyTimeout] = useState<NodeJS.Timeout | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState({
    title: item.title,
    username: item.username,
    password: '',
    url: item.url,
    notes: '',
  });

  useEffect(() => {
    // Decrypt password and notes when component mounts
    try {
      const userEmail = JSON.parse(localStorage.getItem('user') || '{}').email;
      if (item.password && userEmail) {
        const decrypted = clientDecrypt(item.password, userEmail);
        setDecryptedPassword(decrypted);
        setEditForm(prev => ({ ...prev, password: decrypted }));
      }
      if (item.notes && userEmail) {
        const decryptedNotesText = clientDecrypt(item.notes, userEmail);
        setDecryptedNotes(decryptedNotesText);
        setEditForm(prev => ({ ...prev, notes: decryptedNotesText }));
      }
    } catch (error) {
      console.error('Decryption error:', error);
      setDecryptedPassword('Decryption failed');
      setDecryptedNotes('Decryption failed');
    }
  }, [item]);

  const copyToClipboard = async (text: string, fieldType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldType);
      
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
      
      const timeout = setTimeout(() => {
        setCopiedField(null);
      }, 3000);
      
      setCopyTimeout(timeout);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/vault/${item._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        onDelete(item._id);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
    setIsDeleting(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      title: item.title,
      username: item.username,
      password: decryptedPassword,
      url: item.url,
      notes: decryptedNotes,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const encryptedData = {
        title: editForm.title,
        username: editForm.username,
        password: editForm.password,
        url: editForm.url,
        notes: editForm.notes,
      };

      const response = await fetch(`/api/vault/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(encryptedData),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        onUpdate(item._id, updatedItem);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    return () => {
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
    };
  }, [copyTimeout]);

  // Get website favicon
  const getFaviconUrl = (url: string) => {
    if (!url) return null;
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Website Icon */}
            <div className="relative">
              {getFaviconUrl(item.url) ? (
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-700 shadow-md flex items-center justify-center border border-gray-200 dark:border-gray-600">
                  <img 
                    src={getFaviconUrl(item.url)!} 
                    alt={`${item.title} favicon`}
                    className="w-6 h-6"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                  <svg className="w-6 h-6 text-gray-400 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md flex items-center justify-center text-white font-bold text-lg">
                  {item.title.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Title and URL */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleInputChange}
                    className="font-bold text-xl text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    placeholder="Website name"
                  />
                  <input
                    type="text"
                    name="url"
                    value={editForm.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
              ) : (
                <div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  {item.url && (
                    <a
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm truncate block transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.url}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-xl transition-colors shadow-sm"
                  title="Save changes"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-xl transition-colors shadow-sm"
                  title="Cancel edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-xl transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                  title="Edit item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-xl transition-colors shadow-sm opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  title="Delete item"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-red-300 border-t-red-700 rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-5">
        {/* Username Field */}
        <div className="group/field">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Username</span>
            </label>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleInputChange}
                className="flex-1 font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Enter username"
              />
            ) : (
              <>
                <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-600">
                  <span className="font-mono text-gray-800 dark:text-gray-200 select-all">
                    {item.username || 'No username'}
                  </span>
                </div>
                {item.username && (
                  <button
                    onClick={() => copyToClipboard(item.username, 'username')}
                    className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Copy username"
                  >
                    {copiedField === 'username' ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className="group/field">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Password</span>
            </label>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <input
                type="password"
                name="password"
                value={editForm.password}
                onChange={handleInputChange}
                className="flex-1 font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Enter password"
              />
            ) : (
              <>
                <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-600 relative">
                  <span className="font-mono text-gray-800 dark:text-gray-200 select-all">
                    {showPassword ? decryptedPassword : '••••••••••••'}
                  </span>
                </div>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(decryptedPassword, 'password')}
                  className="p-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Copy password"
                >
                  {copiedField === 'password' ? (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Notes Field */}
        {(decryptedNotes || isEditing) && (
          <div className="group/field">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Notes</span>
              </label>
            </div>
            {isEditing ? (
              <textarea
                name="notes"
                value={editForm.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="Add notes (optional)"
              />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-600">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                  {decryptedNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Created {formatDate(item.createdAt)}</span>
        </div>

        {/* Copy Success Message */}
        {copiedField && (
          <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{copiedField.charAt(0).toUpperCase() + copiedField.slice(1)} copied!</span>
          </div>
        )}
      </div>
    </div>
  );
}
