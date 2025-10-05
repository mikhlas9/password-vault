'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Edit, Trash2, ExternalLink } from 'lucide-react';
import { VaultItemDecrypted } from '../lib/types';

interface VaultItemProps {
  item: VaultItemDecrypted;
  onEdit: (item: VaultItemDecrypted) => void;
  onDelete: (id: string) => void;
}

// Auto-clear clipboard utility
const autoClearClipboard = (delay: number = 15000) => {
  setTimeout(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText('');
      }
    } catch (error) {
      // Silently fail - clipboard clearing is not critical
    }
  }, delay);
};

export default function VaultItem({ item, onEdit, onDelete }: VaultItemProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      
      // Auto-clear clipboard after 15 seconds for passwords, 30 seconds for usernames
      const clearDelay = type === 'password' ? 15000 : 30000;
      autoClearClipboard(clearDelay);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openUrl = (url: string) => {
    if (url && !url.startsWith('http')) {
      window.open(`https://${url}`, '_blank');
    } else if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{item.title}</h3>
          {item.url && (
            <button
              onClick={() => openUrl(item.url!)}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-1 transition-colors"
            >
              {item.url}
              <ExternalLink size={12} className="ml-1" />
            </button>
          )}
        </div>
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onEdit(item)}
            className="p-2 cursor-pointer text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => item._id && onDelete(item._id)}
            className="p-2 cursor-pointer text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Username</label>
          <div className="flex items-center justify-between bg-gray-50/80 p-3 rounded-lg border border-gray-200/50">
            <span className="text-sm font-mono text-gray-700">{item.username}</span>
            <button
              onClick={() => copyToClipboard(item.username, 'username')}
              className={`p-2 cursor-pointer rounded-lg hover:bg-gray-200 transition-all ${
                copied === 'username' ? 'text-green-600 bg-green-50' : 'text-gray-500'
              }`}
              title="Copy username"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Password</label>
          <div className="flex items-center justify-between bg-gray-50/80 p-3 rounded-lg border border-gray-200/50">
            <span className="text-sm font-mono flex-1 mr-2 text-gray-700">
              {showPassword ? item.password : '•'.repeat(item.password.length)}
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 cursor-pointer text-gray-500 hover:bg-gray-200 rounded-lg transition-all"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => copyToClipboard(item.password, 'password')}
                className={`p-2 cursor-pointer rounded-lg hover:bg-gray-200 transition-all ${
                  copied === 'password' ? 'text-green-600 bg-green-50' : 'text-gray-500'
                }`}
                title="Copy password"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        {item.notes && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Notes</label>
            <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-200/50">
              <p className="text-sm text-gray-700 leading-relaxed">{item.notes}</p>
            </div>
          </div>
        )}
      </div>

      {copied && (
        <div className="mt-3 text-xs text-green-600 bg-green-50/80 p-2 rounded-lg animate-fade-in">
          {copied === 'username' ? 'Username copied! Auto-clearing in 30s' : 'Password copied! Auto-clearing in 15s'}
        </div>
      )}
    </div>
  );
}