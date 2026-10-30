import React, { useState, useEffect } from 'react';
import { Bike, MapPin, Phone, CheckCircle2, Clock, Navigation, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export const DeliveryView: React.FC = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchDeliveryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [tasksRes, historyRes] = await Promise.all([
        api.getDeliveryTasks(),
        api.getDeliveryHistory(),
      ]);
      setTasks(tasksRes.tasks);
      setAgentInfo(tasksRes.agentInfo);
      setHistory(historyRes.deliveries);
    } catch (err: any) {
      setError(err.message || 'Failed to load delivery tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      setActionSuccess(null);
      const res = await api.updateDeliveryStatus(orderId, newStatus);
      setActionSuccess(res.message);
      await fetchDeliveryData();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Agent Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Bike className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black">{user?.name || 'Vikram Delivery'}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white uppercase">
                Active Fleet
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Vehicle: {agentInfo?.vehicle_type || 'Electric Scooter'} ({agentInfo?.registration_number || 'KA-01-EQ-4491'})
            </p>
            <p className="text-[11px] text-blue-300">
              Service Area: {agentInfo?.current_area || 'Indiranagar & Koramangala'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchDeliveryData}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-lg self-start sm:self-auto transition-colors"
        >
          Refresh Dispatch
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Active Deliveries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">
            Active Deliveries ({tasks.length})
          </h2>
          <span className="text-xs text-stone-500">Live order routes</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-stone-400">Loading deliveries...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500">
            No pending deliveries right now. Great job!
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-xs text-stone-900">Order #{task.id}</span>
                    <h3 className="font-bold text-sm text-stone-900">{task.restaurant_name}</h3>
                    <p className="text-[11px] text-stone-500">{task.restaurant_address}</p>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase self-start sm:self-auto ${
                    task.status === 'Out for Delivery' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {task.status}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Deliver To</span>
                    <p className="font-bold text-stone-900">{task.customer_name}</p>
                    <p className="text-stone-600 leading-tight">{task.delivery_address_snapshot}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Customer Contact</span>
                    <p className="font-medium text-stone-800 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{task.customer_phone || '+91 98765 43210'}</span>
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Collect: ₹{Number(task.final_total).toFixed(2)} ({task.payment_method || 'UPI'} {task.payment_status || 'Paid'})
                    </p>
                  </div>
                </div>

                {/* Procedure Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {task.status !== 'Out for Delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'Out for Delivery')}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                    >
                      Pick Up &amp; Start Delivery
                    </button>
                  )}

                  {task.status === 'Out for Delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'Delivered')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Delivered (Complete)</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed History */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-stone-900">Completed Deliveries</h3>
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-stone-100 text-stone-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-2.5">Order</th>
                <th className="px-4 py-2.5">Restaurant</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5 text-right">Delivered Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-stone-50">
                  <td className="px-4 py-2 font-mono font-bold">#{h.id}</td>
                  <td className="px-4 py-2 text-stone-800">{h.restaurant_name}</td>
                  <td className="px-4 py-2 text-stone-600">{h.customer_name}</td>
                  <td className="px-4 py-2 font-bold tabular-nums">₹{Number(h.final_total).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right text-stone-400 tabular-nums">
                    {new Date(h.updated_at || h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
