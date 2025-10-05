'use client';

import { useState, useEffect } from 'react';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState('');
  const [copyTimeout, setCopyTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar]);

  const generatePassword = () => {
    let charset = '';
    let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lowercase = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilar) {
      uppercase = uppercase.replace(/[IL]/g, '');
      lowercase = lowercase.replace(/[il]/g, '');
      numbers = numbers.replace(/[10]/g, '');
      symbols = symbols.replace(/[|]/g, '');
    }

    if (includeUppercase) charset += uppercase;
    if (includeLowercase) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (!charset) {
      setPassword('');
      return;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setPassword(result);
    calculateStrength(result);
  };

  const calculateStrength = (pwd: string) => {
    let score = 0;
    
    if (pwd.length >= 12) score += 2;
    else if (pwd.length >= 8) score += 1;
    
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 2;
    if (pwd.length >= 16) score += 1;

    if (score <= 2) setStrength('Weak');
    else if (score <= 4) setStrength('Medium');
    else if (score <= 6) setStrength('Strong');
    else setStrength('Very Strong');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setIsCopied(true);
      
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
      
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 3000);
      
      setCopyTimeout(timeout);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 'Weak': return 'text-red-500';
      case 'Medium': return 'text-yellow-500';
      case 'Strong': return 'text-green-500';
      case 'Very Strong': return 'text-green-600';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getStrengthWidth = () => {
    switch (strength) {
      case 'Weak': return 'w-1/4';
      case 'Medium': return 'w-1/2';
      case 'Strong': return 'w-3/4';
      case 'Very Strong': return 'w-full';
      default: return 'w-0';
    }
  };

  const getStrengthBgColor = () => {
    switch (strength) {
      case 'Weak': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Strong': return 'bg-green-500';
      case 'Very Strong': return 'bg-green-600';
      default: return 'bg-gray-300';
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
    };
  }, [copyTimeout]);

  const activeOptionsCount = [includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Password Generator</h2>
            <p className="text-blue-100 mt-1">Create secure passwords instantly</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Generated Password Display */}
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 min-h-[80px]">
              <div className="flex-1 pr-4">
                {password ? (
                  <span className="font-mono text-lg break-all text-gray-800 dark:text-gray-200 leading-relaxed">
                    {password}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    Click generate to create a password
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={copyToClipboard}
                  className="group p-3 hover:bg-white dark:hover:bg-gray-600 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-600"
                  title="Copy to clipboard"
                  disabled={!password}
                >
                  {isCopied ? (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={generatePassword}
                  className="group p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 text-white shadow-lg"
                  title="Generate new password"
                >
                  <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
            {isCopied && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-fade-in-out">
                Password copied!
              </div>
            )}
          </div>

          {/* Password Strength */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password Strength</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${getStrengthColor()}`}>
                {strength}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ease-out ${getStrengthWidth()} ${getStrengthBgColor()}`}></div>
            </div>
          </div>
        </div>

        {/* Settings Panel Toggle */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <button
            onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Password Settings</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Length: {length} characters • {activeOptionsCount} options active
                </p>
              </div>
            </div>
            <svg 
              className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isSettingsExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Collapsible Settings Content */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSettingsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-6 space-y-6">
              {/* Length Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Password Length
                  </label>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-bold">
                    {length}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="4"
                    max="50"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>4</span>
                    <span>50</span>
                  </div>
                </div>
              </div>

              {/* Character Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Include Characters</h4>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Uppercase Letters (A-Z)', state: includeUppercase, setter: setIncludeUppercase, icon: 'Aa' },
                    { label: 'Lowercase Letters (a-z)', state: includeLowercase, setter: setIncludeLowercase, icon: 'aa' },
                    { label: 'Numbers (0-9)', state: includeNumbers, setter: setIncludeNumbers, icon: '123' },
                    { label: 'Special Characters (!@#$)', state: includeSymbols, setter: setIncludeSymbols, icon: '@#' },
                    { label: 'Exclude Similar Characters', state: excludeSimilar, setter: setExcludeSimilar, icon: '≠', description: 'Excludes characters like i, l, 1, L, o, 0, O' }
                  ].map((option, index) => (
                    <label key={index} className="group flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={option.state}
                          onChange={(e) => option.setter(e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 dark:bg-gray-700 transition-colors"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                            {option.icon}
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {option.label}
                          </span>
                        </div>
                        {option.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePassword}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Generate New Password</span>
          </div>
        </button>
      </div>
    </div>
  );
}
