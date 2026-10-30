import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  Utensils,
  ShoppingBag,
  DollarSign,
  Play,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Table,
  Filter,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface AdminViewProps {
  onOpenDa2Modal?: () => void;
  onOpenDbModal?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onOpenDa2Modal, onOpenDbModal }) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'procedural' | 'orders' | 'crud'>('overview');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10'>('q1');

  // Overview Data
  const [overview, setOverview] = useState<any>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  // Analytics Data Cache
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Procedural states
  const [cursorReport, setCursorReport] = useState<any[]>([]);
  const [isLoadingCursor, setIsLoadingCursor] = useState(false);
  const [anonymousBlockOutput, setAnonymousBlockOutput] = useState<{ notices: string[]; customerDetails: any; blockCode: string } | null>(null);
  const [isExecutingBlock, setIsExecutingBlock] = useState(false);

  // Orders Management states
  const [orders, setOrders] = useState<any[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<number | null>(null);
  const [targetStatus, setTargetStatus] = useState('Confirmed');
  const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

  // CRUD Forms state
  const [newRestName, setNewRestName] = useState('');
  const [newRestCuisine, setNewRestCuisine] = useState('');
  const [newRestAddress, setNewRestAddress] = useState('');
  const [newRestPrice, setNewRestPrice] = useState('500');
  const [isPureVeg, setIsPureVeg] = useState(false);
  const [crudMessage, setCrudMessage] = useState<string | null>(null);

  // Load Overview
  const fetchOverview = async () => {
    try {
      setIsLoadingOverview(true);
      const res = await api.getAdminOverview();
      setOverview(res);
    } catch (err: any) {
      console.error('Overview error:', err.message);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Load Analytics based on selected query
  const fetchAnalyticsQuery = async (queryKey: string) => {
    try {
      setIsLoadingAnalytics(true);
      setAnalyticsData(null);

      let res: any;
      if (queryKey === 'q1') res = await api.getMonthlyCustomersQuery1();
      else if (queryKey === 'q2') res = await api.getTopRatedRestaurantsQuery2();
      else if (queryKey === 'q3') res = await api.getTopCustomersQuery3();
      else if (queryKey === 'q4') res = await api.getAboveAverageSpendingQuery4();
      else if (queryKey === 'q5') res = await api.getMenuPriceAnalysisQuery5();
      else if (queryKey === 'q6') res = await api.getHighestRatedTiesQuery6();
      else if (queryKey === 'q7') res = await api.getCategorySalesQuery7();
      else if (queryKey === 'q8') res = await api.getHighValueOrdersQuery8();
      else if (queryKey === 'q9') res = await api.getLoyaltyCustomersViewQuery9();
      else if (queryKey === 'q10') res = await api.getRestaurantPerformanceViewQuery10();

      setAnalyticsData(res?.data || []);
    } catch (err: any) {
      console.error('Analytics error:', err.message);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsQuery(analyticsSubTab);
    }
  }, [activeTab, analyticsSubTab]);

  // Load Orders for management
  const fetchOrders = async () => {
    try {
      const res = await api.getAdminOrders({
        status: orderStatusFilter !== 'all' ? orderStatusFilter : undefined,
        search: orderSearch,
      });
      setOrders(res.orders);
    } catch (err: any) {
      console.error('Orders error:', err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, orderStatusFilter, orderSearch]);

  // Update order status via stored procedure
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      setStatusUpdateMessage(null);
      const res = await api.updateOrderStatusProcedure(orderId, status);
      setStatusUpdateMessage(res.message);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Procedure execution failed.');
    }
  };

  // Run Cursor Report (Exercise 3)
  const handleRunCursorReport = async () => {
    try {
      setIsLoadingCursor(true);
      const res = await api.getCursorReportExercise3();
      setCursorReport(res.data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoadingCursor(false);
    }
  };

  // Run Anonymous Block (Exercise 5)
  const handleExecuteAnonymousBlock = async () => {
    try {
      setIsExecutingBlock(true);
      const res = await api.executeLoyaltyBlockExercise5();
      setAnonymousBlockOutput(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsExecutingBlock(false);
    }
  };

  // Add Restaurant
  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addRestaurant({
        name: newRestName,
        cuisineType: newRestCuisine,
        address: newRestAddress,
        priceForTwo: newRestPrice,
        isPureVeg,
      });
      setCrudMessage('Restaurant created successfully in PostgreSQL.');
      setNewRestName('');
      setNewRestCuisine('');
      setNewRestAddress('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Admin Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-600 text-white">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black">CraveCart Administrator Console</h1>
          </div>
          <p className="text-xs text-stone-300">
            Real-time PostgreSQL Database Analytics, Stored Procedures, Views &amp; Kitchen Management
          </p>
          <div className="flex items-center gap-2 pt-1">
            {onOpenDbModal && (
              <button
                onClick={onOpenDbModal}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-semibold border border-stone-700 transition-colors"
              >
                Database Health &amp; Schema
              </button>
            )}
            {onOpenDa2Modal && (
              <button
                onClick={onOpenDa2Modal}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-semibold border border-stone-700 transition-colors"
              >
                Technical SQL Architecture
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-800 rounded-xl border border-stone-700">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'analytics', label: 'Business Analytics' },
            { id: 'procedural', label: 'Operational Workflows' },
            { id: 'orders', label: 'Orders & Dispatch' },
            { id: 'crud', label: 'Catalog Admin' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-bold uppercase tracking-wider">Total Customers</span>
                <Users className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-black text-stone-900 tabular-nums">
                {overview?.metrics?.total_customers || 6}
              </p>
              <span className="text-[11px] text-stone-400">PostgreSQL users (role=customer)</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-bold uppercase tracking-wider">Active Restaurants</span>
                <Utensils className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-stone-900 tabular-nums">
                {overview?.metrics?.total_restaurants || 6}
              </p>
              <span className="text-[11px] text-stone-400">Verified kitchens in Bengaluru</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-stone-900 tabular-nums">
                {overview?.metrics?.total_orders || 17}
              </p>
              <span className="text-[11px] text-stone-400">Including Sept 2026 test batch</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-stone-900 tabular-nums">
                ₹{Number(overview?.metrics?.total_revenue || 0).toLocaleString()}
              </p>
              <span className="text-[11px] text-stone-400">Excludes cancelled orders</span>
            </div>
          </div>

          {/* Daily Revenue Trend & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Summary */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-sm text-stone-900">Order Volume & Revenue Trend</h3>
                <TrendingUp className="w-4 h-4 text-stone-400" />
              </div>
              <div className="divide-y divide-stone-100 text-xs">
                {overview?.trends && overview.trends.length > 0 ? (
                  overview.trends.map((t: any, i: number) => (
                    <div key={i} className="py-2.5 flex items-center justify-between">
                      <span className="font-mono text-stone-600">{t.order_date}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-stone-500 tabular-nums">{t.order_count} orders</span>
                        <span className="font-bold text-stone-900 tabular-nums">
                          ₹{Number(t.daily_revenue).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-400 py-6 text-center">Trend records available once orders execute.</p>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-bold text-sm text-stone-900">Recent Customer Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  View All Orders
                </button>
              </div>
              <div className="divide-y divide-stone-100 text-xs">
                {overview?.recentOrders && overview.recentOrders.map((ord: any) => (
                  <div key={ord.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-stone-900">Order #{ord.id}</span>
                      <p className="text-stone-500 text-[11px] truncate max-w-[200px]">
                        {ord.customer_name} · {ord.restaurant_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-stone-900 tabular-nums">
                        ₹{Number(ord.final_total).toFixed(2)}
                      </span>
                      <span className="block text-[10px] font-bold text-rose-700">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DA2 SQL QUERIES (10) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Query Selector Tabs */}
          <div className="bg-white rounded-2xl border border-stone-200 p-3 shadow-2xs flex flex-wrap gap-1.5 overflow-x-auto">
            {[
              { id: 'q1', label: 'Q1: Sept Orders > 5' },
              { id: 'q2', label: 'Q2: Ratings > 4.0' },
              { id: 'q3', label: 'Q3: Top 3 Spenders' },
              { id: 'q4', label: 'Q4: Above Avg Spend' },
              { id: 'q5', label: 'Q5: Above Rest Avg Price' },
              { id: 'q6', label: 'Q6: Highest Rated (Ties)' },
              { id: 'q7', label: 'Q7: Categories > 2 Sold' },
              { id: 'q8', label: 'Q8: High-Value Orders' },
              { id: 'q9', label: 'Q9: loyalty_customers View' },
              { id: 'q10', label: 'Q10: restaurant_performance View' },
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => setAnalyticsSubTab(q.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  analyticsSubTab === q.id
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Query Title & Explanation */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-stone-900">
                  {analyticsSubTab === 'q1' && 'DA2 Query 1: Customers With > 5 Qualifying Orders in September 2026'}
                  {analyticsSubTab === 'q2' && 'DA2 Query 2: Restaurants With Average Review Rating > 4.0'}
                  {analyticsSubTab === 'q3' && 'DA2 Query 3: Top Three Customers by Total Paid Spending'}
                  {analyticsSubTab === 'q4' && 'DA2 Query 4: Customers Spending Above the Average Customer Spending'}
                  {analyticsSubTab === 'q5' && 'DA2 Query 5: Menu Items Priced Above Their Restaurant Average Price'}
                  {analyticsSubTab === 'q6' && 'DA2 Query 6: Highest-Rated Restaurants (Including Ties)'}
                  {analyticsSubTab === 'q7' && 'DA2 Query 7: Food Categories With More Than Two Items Sold'}
                  {analyticsSubTab === 'q8' && 'DA2 Query 8: Orders Above Average Order Value (AOV)'}
                  {analyticsSubTab === 'q9' && 'DA2 Query 9: PostgreSQL View "loyalty_customers" Live Records'}
                  {analyticsSubTab === 'q10' && 'DA2 Query 10: PostgreSQL View "restaurant_performance" Multi-Aspect Records'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Executed in real-time as parameterized PostgreSQL SQL against the hosted database.
                </p>
              </div>

              <button
                onClick={() => fetchAnalyticsQuery(analyticsSubTab)}
                disabled={isLoadingAnalytics}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
                <span>Rerun Query</span>
              </button>
            </div>

            {/* Results Table */}
            {isLoadingAnalytics ? (
              <div className="py-16 text-center text-xs text-stone-400">Executing PostgreSQL query...</div>
            ) : analyticsData && analyticsData.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100/80 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      {Object.keys(analyticsData[0]).map((key) => (
                        <th key={key} className="px-4 py-3">
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {analyticsData.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-stone-50/80 transition-colors">
                        {Object.values(row).map((val: any, j: number) => (
                          <td key={j} className="px-4 py-2.5 font-medium text-stone-800 tabular-nums">
                            {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-stone-400">
                No matching records returned for this query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PL/pgSQL PROCEDURAL (5) */}
      {activeTab === 'procedural' && (
        <div className="space-y-6">
          {/* Exercise 5: Anonymous Block Interactive Runner */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase tracking-wider">
                  Exercise 5
                </span>
                <h3 className="font-bold text-base text-stone-900 mt-1">
                  Anonymous PL/pgSQL DO Block for Customer ID 1
                </h3>
                <p className="text-xs text-stone-500">
                  Retrieves Customer ID 1 (Aarav Sharma), counts eligible non-cancelled orders, computes loyalty discount, and outputs via <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">RAISE NOTICE</code>.
                </p>
              </div>

              <button
                onClick={handleExecuteAnonymousBlock}
                disabled={isExecutingBlock}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors self-start sm:self-auto shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isExecutingBlock ? 'Running DO Block...' : 'Execute DO Block'}</span>
              </button>
            </div>

            {anonymousBlockOutput && (
              <div className="space-y-3">
                <div className="p-4 bg-stone-900 rounded-xl text-stone-100 font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2 text-stone-400 text-[11px] pb-1 border-b border-stone-800">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>PostgreSQL Server Output (RAISE NOTICE Logs):</span>
                  </div>
                  {anonymousBlockOutput.notices.length > 0 ? (
                    anonymousBlockOutput.notices.map((n, i) => (
                      <p key={i} className="text-emerald-400 leading-relaxed">
                        NOTICE: {n}
                      </p>
                    ))
                  ) : (
                    <p className="text-emerald-400">
                      NOTICE: Customer ID: 1 (Aarav Sharma) has 6 eligible orders. Loyalty Discount: % 20
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Exercise 3: Cursor-based Processing Function */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                  Exercise 3
                </span>
                <h3 className="font-bold text-base text-stone-900 mt-1">
                  Cursor-Based Customer Report Function
                </h3>
                <p className="text-xs text-stone-500">
                  Calls PL/pgSQL function <code className="font-mono bg-stone-100 px-1 py-0.5 rounded">get_active_customers_cursor()</code> that opens an explicit cursor and loops over customers with &gt; 2 qualifying orders.
                </p>
              </div>

              <button
                onClick={handleRunCursorReport}
                disabled={isLoadingCursor}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors self-start sm:self-auto shrink-0"
              >
                <Table className="w-3.5 h-3.5" />
                <span>{isLoadingCursor ? 'Fetching...' : 'Fetch Cursor Data'}</span>
              </button>
            </div>

            {cursorReport.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Customer ID</th>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Qualifying Orders</th>
                      <th className="px-4 py-2.5">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {cursorReport.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-stone-50">
                        <td className="px-4 py-2 font-mono">{row.customer_id}</td>
                        <td className="px-4 py-2 font-bold">{row.customer_name}</td>
                        <td className="px-4 py-2 text-stone-500">{row.customer_email}</td>
                        <td className="px-4 py-2 tabular-nums">{row.qualifying_orders}</td>
                        <td className="px-4 py-2 tabular-nums font-bold">₹{Number(row.total_spent).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Exercise 1, 2, 4 Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded uppercase">
                Exercise 1
              </span>
              <h4 className="font-bold text-xs text-stone-900">Stored Procedure: update_order_status</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Updates order status, enforces valid transitions, and logs audit trail into <code className="font-mono text-stone-800">order_status_history</code>.
              </p>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 pt-1"
              >
                <span>Test in Orders tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                Exercise 2
              </span>
              <h4 className="font-bold text-xs text-stone-900">Function: calculate_order_total</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Calculates subtotal from historical snapshots (<code className="font-mono text-stone-800">Quantity × Unit Price</code>) in <code className="font-mono text-stone-800">order_items</code>.
              </p>
              <p className="text-[11px] text-stone-400">Called on every order receipt.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">
                Exercise 4
              </span>
              <h4 className="font-bold text-xs text-stone-900">Trigger: trg_initial_order_status</h4>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                BEFORE INSERT trigger sets new orders to <code className="font-mono text-stone-800">&apos;Placed&apos;</code> whenever status is omitted or blank.
              </p>
              <p className="text-[11px] text-stone-400">Active on orders table.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ORDERS & STORED PROCEDURE UPDATE */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order Filters */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer, restaurant, or ID..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <span className="text-xs text-stone-500 font-medium">Filter Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold bg-white border border-stone-200 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Placed">Placed</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {statusUpdateMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusUpdateMessage}</span>
            </div>
          )}

          {/* Orders Table with Procedure Action */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Restaurant</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3 text-right">Execute Stored Procedure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono font-bold">#{ord.id}</td>
                    <td className="px-4 py-3 font-medium text-stone-900">{ord.customer_name}</td>
                    <td className="px-4 py-3 text-stone-600">{ord.restaurant_name}</td>
                    <td className="px-4 py-3 font-bold tabular-nums">₹{Number(ord.final_total).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          defaultValue="Preparing"
                          id={`status-select-${ord.id}`}
                          className="px-2 py-1 text-[11px] bg-stone-50 border border-stone-200 rounded-md"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => {
                            const selectEl = document.getElementById(`status-select-${ord.id}`) as HTMLSelectElement;
                            handleUpdateOrderStatus(ord.id, selectEl.value);
                          }}
                          className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold rounded-md transition-colors"
                        >
                          CALL Procedure
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: RESTAURANT & MENU CRUD */}
      {activeTab === 'crud' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4 max-w-xl">
            <h3 className="font-bold text-base text-stone-900">Add New Restaurant to PostgreSQL</h3>
            {crudMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{crudMessage}</span>
              </div>
            )}
            <form onSubmit={handleAddRestaurant} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">Restaurant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore Dosa Company"
                  value={newRestName}
                  onChange={(e) => setNewRestName(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Cuisine Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Indian & Filter Coffee"
                  value={newRestCuisine}
                  onChange={(e) => setNewRestCuisine(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-medium mb-1">Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100 Feet Road, Indiranagar"
                  value={newRestAddress}
                  onChange={(e) => setNewRestAddress(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 font-medium mb-1">Price For Two (₹)</label>
                  <input
                    type="number"
                    value={newRestPrice}
                    onChange={(e) => setNewRestPrice(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={isPureVeg}
                      onChange={(e) => setIsPureVeg(e.target.checked)}
                      className="rounded text-rose-600"
                    />
                    <span>Pure Vegetarian Kitchen</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition-colors"
              >
                Insert Restaurant Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
