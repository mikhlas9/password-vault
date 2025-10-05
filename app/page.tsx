'use client'
import Link from 'next/link'
import { Shield, Key, Lock, Eye } from 'lucide-react'

export default function Home() {
  return (
    <>
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              <Shield className="w-6 h-6" />
              Password Vault
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors px-4 py-2 rounded-md"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                Get Started
              </Link>
            </nav>
            <button className="md:hidden text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full shadow-lg">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
              Password Vault
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              A secure, privacy-first password manager with client-side encryption. 
              Generate strong passwords and store them safely in your personal vault.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Key className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Generate Strong Passwords</h3>
              <p className="text-gray-600 leading-relaxed">
                Create secure passwords with customizable options including length, 
                character types, and exclusion of similar characters.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group">
              <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Lock className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Client-Side Encryption</h3>
              <p className="text-gray-600 leading-relaxed">
                Your passwords are encrypted in your browser before being stored. 
                We never see your plaintext passwords.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center group">
              <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Eye className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Easy Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Search, edit, and manage your passwords with a clean, intuitive interface. 
                Copy credentials with auto-clearing clipboard.
              </p>
            </div>
          </div>

          <div className="text-center mt-20">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                Privacy-First Design
              </h2>
              <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                Your data is encrypted using AES-256 encryption with your email as the key. 
                Even if our servers are compromised, your passwords remain secure and unreadable.
              </p>
              <p className="text-sm text-gray-500 font-medium">
                Built with Next.js, TypeScript, and MongoDB
              </p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </>
  )
}