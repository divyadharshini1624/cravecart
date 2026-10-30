import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Tag, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

interface CartDrawerProps {
  onOrderSuccess: (orderId: number) => void;
  onOpenAuthModal: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderSuccess, onOpenAuthModal }) => {
  const { cart, isCartOpen, closeCart, updateQuantity, removeItem, clearCart, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('Flat 402, Prestige Palms, 12th Main, Indiranagar, Bengaluru');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Loyalty bracket state fetched from server
  const [loyaltyInfo, setLoyaltyInfo] = useState<{
    eligibleOrders: number;
    discountPercentage: number;
    totalSpending: number;
  }>({
    eligibleOrders: 0,
    discountPercentage: 0,
    totalSpending: 0,
  });

  useEffect(() => {
    if (isAuthenticated) {
      api.getLoyalty()
        .then((res) => {
          setLoyaltyInfo({
            eligibleOrders: res.loyalty.eligibleOrders,
            discountPercentage: res.loyalty.discountPercentage,
            totalSpending: res.loyalty.totalSpending,
          });
        })
        .catch(() => {});
    }
  }, [isAuthenticated, isCartOpen]);

  if (!isCartOpen) return null;

  const subtotal = cart?.subtotal || 0;
  const deliveryFee = subtotal > 0 ? 40 : 0;

  // Calculate live loyalty discount based on actual PostgreSQL view
  const loyaltyPct = loyaltyInfo.discountPercentage || 0;
  const loyaltyDiscount = loyaltyPct > 0 ? Math.round((subtotal * (loyaltyPct / 100)) * 100) / 100 : 0;

  // Simple coupon discount simulation on client for preview, validated strictly on server
  let couponDiscount = 0;
  if (appliedCoupon === 'CRAVE50' && subtotal >= 299) {
    couponDiscount = Math.min(subtotal * 0.5, 150);
  } else if (appliedCoupon === 'WELCOME100' && subtotal >= 399) {
    couponDiscount = 100;
  } else if (appliedCoupon === 'FEAST20' && subtotal >= 499) {
    couponDiscount = Math.min(subtotal * 0.2, 200);
  }

  const grandTotal = Math.max(0, Math.round((subtotal - loyaltyDiscount - couponDiscount + deliveryFee) * 100) / 100);

  const handleApplyCoupon = (codeToApply: string) => {
    const code = codeToApply.toUpperCase().trim();
    if (code === 'CRAVE50' && subtotal < 299) {
      setOrderError('CRAVE50 requires minimum order value of ₹299');
      return;
    }
    if (code === 'WELCOME100' && subtotal < 399) {
      setOrderError('WELCOME100 requires minimum order value of ₹399');
      return;
    }
    if (code === 'FEAST20' && subtotal < 499) {
      setOrderError('FEAST20 requires minimum order value of ₹499');
      return;
    }
    setAppliedCoupon(code);
    setOrderError(null);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      onOpenAuthModal();
      return;
    }

    if (!cart || cart.items.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }

    setIsPlacingOrder(true);
    setOrderError(null);

    try {
      const res = await api.placeOrder({
        addressText: deliveryAddress,
        couponCode: appliedCoupon || undefined,
        paymentMethod,
      });

      await refreshCart();
      closeCart();
      onOrderSuccess(res.orderId);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">Your CraveCart</h3>
              <p className="text-xs text-stone-500 line-clamp-1">
                {cart?.restaurantName ? cart.restaurantName : 'Items from your selected restaurant'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {(!cart || cart.items.length === 0) ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-stone-900 text-base">Your cart is empty</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Explore delicious dishes from top-rated restaurants and add your cravings!
              </p>
              <button
                onClick={closeCart}
                className="mt-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <>
              {/* Restaurant Header & Clear Cart */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  {cart.restaurantName}
                </span>
                <button
                  onClick={clearCart}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.cart_item_id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${item.is_veg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        <h5 className="font-semibold text-xs text-stone-900 truncate">{item.name}</h5>
                      </div>
                      <p className="text-xs text-stone-600 font-medium mt-0.5 tabular-nums">
                        ₹{Number(item.price)} each
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-2 py-1 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                        className="text-stone-500 hover:text-stone-900 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-stone-900 w-4 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                        className="text-stone-500 hover:text-stone-900 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right shrink-0 min-w-[50px]">
                      <span className="font-bold text-xs text-stone-900 tabular-nums">
                        ₹{Number(item.item_total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CraveRewards Loyalty Discount Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-900">
                      CraveRewards Loyalty Program
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    {loyaltyPct}% OFF
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-tight">
                  {loyaltyPct > 0
                    ? `Your CraveRewards account qualifies for a ${loyaltyPct}% loyalty discount based on ${loyaltyInfo.eligibleOrders} completed orders!`
                    : `You have ${loyaltyInfo.eligibleOrders} completed orders. Reach 3 orders for 10% Gold tier, or >5 for 20% Platinum!`}
                </p>
              </div>

              {/* Coupons Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                  <Tag className="w-3.5 h-3.5 text-rose-600" />
                  <span>Apply Promotional Coupon</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. CRAVE50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <button
                    onClick={() => handleApplyCoupon(couponCode)}
                    className="px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {/* Quick Coupon Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    { code: 'CRAVE50', label: '50% off (min ₹299)' },
                    { code: 'WELCOME100', label: '₹100 flat (min ₹399)' },
                    { code: 'FEAST20', label: '20% off (min ₹499)' },
                  ].map((cp) => (
                    <button
                      key={cp.code}
                      onClick={() => handleApplyCoupon(cp.code)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                        appliedCoupon === cp.code
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {cp.code}: {cp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">Delivery Address</label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none text-stone-800"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">Simulated Payment Method</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['UPI', 'Credit Card', 'Debit Card', 'Cash on Delivery'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2 rounded-lg border font-medium text-left transition-all ${
                        paymentMethod === m
                          ? 'border-rose-500 bg-rose-50/50 text-rose-800 ring-1 ring-rose-500 font-semibold'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400">
                  Secure simulated payment flow. Zero bank account deduction.
                </p>
              </div>

              {/* Bill Details Summary */}
              <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Item Subtotal</span>
                  <span className="font-semibold tabular-nums">₹{subtotal.toFixed(2)}</span>
                </div>
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Loyalty Discount ({loyaltyPct}%)</span>
                    <span className="tabular-nums">- ₹{loyaltyDiscount.toFixed(2)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-rose-700 font-medium">
                    <span>Coupon ({appliedCoupon})</span>
                    <span className="tabular-nums">- ₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Delivery Partner Fee</span>
                  <span className="tabular-nums">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                  <span>To Pay</span>
                  <span className="tabular-nums text-rose-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {orderError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{orderError}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Checkout Button in Drawer Footer */}
        {cart && cart.items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50">
            <button
              onClick={handleCheckout}
              disabled={isPlacingOrder}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-between"
            >
              <span>{isPlacingOrder ? 'Processing Order...' : 'Place Order & Pay'}</span>
              <span className="flex items-center gap-1.5">
                <span className="tabular-nums">₹{grandTotal.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
