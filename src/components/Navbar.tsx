import React, { useState } from 'react';
import { ShoppingBag, MapPin, Database, ChevronDown, User, ShieldCheck, Bike, LogOut, Tag, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { DbStatus } from '../types';

interface NavbarProps {
  currentView: 'home' | 'restaurant' | 'orders' | 'profile' | 'admin' | 'delivery';
  setCurrentView: (view: 'home' | 'restaurant' | 'orders' | 'profile' | 'admin' | 'delivery') => void;
  dbStatus: DbStatus | null;
  onOpenDbModal: () => void;
  onOpenOffersModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  dbStatus,
  onOpenDbModal,
  onOpenOffersModal,
  onOpenAuthModal,
}) => {
  const { user, isAuthenticated, logout, switchDemoRole } = useAuth();
  const { cart, openCart } = useCart();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Banner Notice for DB Setup if not connected */}
      {dbStatus && !dbStatus.connected && (
        <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-700" />
            <span>
              <strong>PostgreSQL:</strong> {dbStatus.error || 'DATABASE_URL not connected yet'}.
            </span>
          </div>
          <button
            onClick={onOpenDbModal}
            className="font-medium underline hover:text-amber-950 transition-colors whitespace-nowrap ml-2"
          >
            Configure Neon DB
          </button>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand & Location */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-rose-200 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors">
                Crave<span className="text-rose-600">Cart</span>
              </span>
              <p className="hidden sm:block text-[10px] text-stone-400 font-medium -mt-1 tracking-wider uppercase">
                Good food. Great mood.
              </p>
            </div>
          </button>

          {/* Delivery Location selector */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100/80 text-stone-700 text-xs font-medium border border-stone-200/60">
            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="text-stone-900 font-semibold truncate max-w-[140px]">Indiranagar</span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-500 truncate max-w-[120px]">Bengaluru</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => setCurrentView('home')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'home' ? 'text-rose-600 font-semibold' : 'hover:text-stone-900'
            }`}
          >
            Restaurants
          </button>
          <button
            onClick={() => setCurrentView('orders')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'orders' ? 'text-rose-600 font-semibold' : 'hover:text-stone-900'
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'profile' ? 'text-rose-600 font-semibold' : 'hover:text-stone-900'
            }`}
          >
            Loyalty & Profile
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center gap-1.5 whitespace-nowrap text-rose-700 font-semibold px-2.5 py-1 rounded-md bg-rose-50 transition-colors ${
                currentView === 'admin' ? 'ring-1 ring-rose-300' : ''
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          )}
          {user?.role === 'delivery_agent' && (
            <button
              onClick={() => setCurrentView('delivery')}
              className={`flex items-center gap-1.5 whitespace-nowrap text-blue-700 font-semibold px-2.5 py-1 rounded-md bg-blue-50 transition-colors ${
                currentView === 'delivery' ? 'ring-1 ring-blue-300' : ''
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Delivery Fleet</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Offers & Deals Button */}
          <button
            onClick={onOpenOffersModal}
            title="Special Offers, Coupons & CraveRewards"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200/80 transition-all shadow-2xs hover:scale-102 active:scale-98"
          >
            <Tag className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Offers &amp; Deals</span>
          </button>

          {/* Cart Bag Button */}
          <button
            onClick={openCart}
            className="relative flex items-center justify-center p-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cart && cart.itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                {cart.itemCount}
              </span>
            )}
          </button>

          {/* User Account / Role Switcher */}
          <div className="relative">
            {isAuthenticated ? (
              <div className="flex items-center">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-medium text-stone-800 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                    {user?.name.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">{user?.name}</span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50">
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold uppercase tracking-wider">
                        Role: {user?.role}
                      </span>
                    </div>

                    <div className="px-3 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Switch Demo Profile
                    </div>

                    <button
                      onClick={() => {
                        switchDemoRole('customer');
                        setCurrentView('home');
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-rose-50 flex items-center justify-between"
                    >
                      <span>Customer (Aarav · 20% Tier)</span>
                      {user?.role === 'customer' && <span className="text-rose-600 text-[10px] font-bold">✓ Active</span>}
                    </button>

                    <button
                      onClick={() => {
                        switchDemoRole('admin');
                        setCurrentView('admin');
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-rose-50 flex items-center justify-between"
                    >
                      <span>Admin Console (Live DB)</span>
                      {user?.role === 'admin' && <span className="text-rose-600 text-[10px] font-bold">✓ Active</span>}
                    </button>

                    <button
                      onClick={() => {
                        switchDemoRole('delivery_agent');
                        setCurrentView('delivery');
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-stone-700 hover:bg-rose-50 flex items-center justify-between"
                    >
                      <span>Delivery Fleet (Agent Vikram)</span>
                      {user?.role === 'delivery_agent' && <span className="text-rose-600 text-[10px] font-bold">✓ Active</span>}
                    </button>

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsRoleDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
