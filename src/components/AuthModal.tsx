import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, CheckCircle2, ShieldCheck, Bike, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, switchDemoRole } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'admin' | 'delivery_agent'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, phone, role });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole: 'customer' | 'admin' | 'delivery_agent') => {
    setIsLoading(true);
    setError(null);
    try {
      await switchDemoRole(demoRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-6">
          <h3 className="text-xl font-black text-stone-900">
            {mode === 'login' ? 'Sign In to CraveCart' : 'Create CraveCart Account'}
          </h3>
          <p className="text-xs text-stone-500">
            {mode === 'login'
              ? 'Access saved addresses, loyalty discounts, and real-time tracking.'
              : 'Join CraveCart to start ordering delicious food with live loyalty rewards.'}
          </p>
        </div>

        {/* Quick Demo Logins Bar */}
        <div className="mb-5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block text-center">
            One-Click Demo Profiles
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="p-2 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-300 rounded-xl text-center text-xs transition-colors"
            >
              <User className="w-4 h-4 text-rose-600 mx-auto mb-0.5" />
              <span className="font-bold text-stone-800 block text-[11px]">Customer</span>
              <span className="text-[9px] text-stone-400 block truncate">Aarav (20%)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-300 rounded-xl text-center text-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-rose-600 mx-auto mb-0.5" />
              <span className="font-bold text-stone-800 block text-[11px]">Admin</span>
              <span className="text-[9px] text-stone-400 block truncate">Full Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('delivery_agent')}
              className="p-2 bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-300 rounded-xl text-center text-xs transition-colors"
            >
              <Bike className="w-4 h-4 text-blue-600 mx-auto mb-0.5" />
              <span className="font-bold text-stone-800 block text-[11px]">Delivery</span>
              <span className="text-[9px] text-stone-400 block truncate">Agent Vikram</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex border-b border-stone-100 mb-4 text-xs font-bold">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 pb-2 text-center border-b-2 transition-colors ${
              mode === 'login' ? 'border-rose-600 text-rose-600' : 'border-transparent text-stone-400'
            }`}
          >
            Password Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 pb-2 text-center border-b-2 transition-colors ${
              mode === 'register' ? 'border-rose-600 text-rose-600' : 'border-transparent text-stone-400'
            }`}
          >
            Register Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-stone-600 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-colors text-xs"
          >
            {isLoading
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In to CraveCart'
              : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
