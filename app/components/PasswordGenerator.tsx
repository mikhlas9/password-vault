'use client';

import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Settings } from 'lucide-react';
import { generatePassword, calculatePasswordStrength } from '../utils/password';
import { PasswordOptions } from '../lib/types';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
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

export default function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
  });
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const strength = password ? calculatePasswordStrength(password) : null;

  useEffect(() => {
    generateNewPassword();
  }, [options]);

  const generateNewPassword = () => {
    const newPassword = generatePassword(options);
    setPassword(newPassword);
    onPasswordGenerated?.(newPassword);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Clear "copied" indicator after 2 seconds
      
      // Auto-clear clipboard after 15 seconds
      autoClearClipboard(15000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
          Password Generator
        </h2>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
        >
          <Settings size={20} />
        </button>
      </div>

      {showOptions && (
        <div className="mb-6 p-4 bg-gray-50/80 rounded-xl space-y-4 border border-gray-200/50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length: {options.length}
            </label>
            <input
              type="range"
              min="8"
              max="50"
              value={options.length}
              onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                checked={options.includeUppercase}
                onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })}
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm">Uppercase (A-Z)</span>
            </label>

            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                checked={options.includeLowercase}
                onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })}
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm">Lowercase (a-z)</span>
            </label>

            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                checked={options.includeNumbers}
                onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm">Numbers (0-9)</span>
            </label>

            <label className="flex items-center text-gray-700">
              <input
                type="checkbox"
                checked={options.includeSymbols}
                onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm">Symbols</span>
            </label>
          </div>

          <label className="flex items-center text-gray-700">
            <input
              type="checkbox"
              checked={options.excludeSimilar}
              onChange={(e) => setOptions({ ...options, excludeSimilar: e.target.checked })}
              className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm">Exclude similar characters (i, l, 1, L, o, 0, O)</span>
          </label>
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={password}
            readOnly
            className="w-full p-3 pr-20 border border-gray-300/50 rounded-xl font-mono text-sm bg-gray-50/80 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Generated password will appear here"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <button
              onClick={copyToClipboard}
              className={`p-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-all ${copied ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}
              title="Copy to clipboard"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={generateNewPassword}
              className="p-2 text-gray-500 cursor-pointer hover:bg-gray-200 rounded-lg transition-all"
              title="Generate new password"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        {copied && (
          <p className="text-xs text-green-600 mt-2">
            Copied! Clipboard will auto-clear in 15 seconds
          </p>
        )}
      </div>

      {strength && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Strength:</span>
            <span className={`text-sm font-medium ${strength.color}`}>
              {strength.label}
            </span>
          </div>
          <div className="w-full bg-gray-200/50 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                strength.score <= 2 ? 'bg-red-500' :
                strength.score <= 4 ? 'bg-yellow-500' :
                strength.score <= 6 ? 'bg-blue-500' : 'bg-green-500'
              }`}
              style={{ width: `${(strength.score / 7) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <button
        onClick={generateNewPassword}
        className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
      >
        Generate New Password
      </button>
    </div>
  );
}