import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dashboardApi } from '../services/api';
import type { DashboardSummary } from '../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await dashboardApi.getSummary();
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-red-500">データの取得に失敗しました</div>
    );
  }

  const categoryChartData = (summary.stock_by_category || []).map((item) => ({
    name: item.category_name,
    value: item.total_quantity,
  }));

  const warehouseChartData = (summary.stock_by_warehouse || []).map((item) => ({
    name: item.warehouse_name,
    value: item.total_quantity,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">登録商品数</h3>
          <p className="text-3xl font-bold text-blue-600">{summary.total_products}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">倉庫数</h3>
          <p className="text-3xl font-bold text-green-600">{summary.total_warehouses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">総在庫数量</h3>
          <p className="text-3xl font-bold text-orange-600">{summary.total_stock_value.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">在庫少商品</h3>
          <p className="text-3xl font-bold text-red-600">{summary.low_stock_items}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Warehouse */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">倉庫別在庫数量</h3>
          {warehouseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={warehouseChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" name="数量" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              データがありません
            </div>
          )}
        </div>

        {/* Stock by Category */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">カテゴリ別在庫数量</h3>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              データがありません
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">最近の入出庫</h3>
        {summary.recent_transactions && summary.recent_transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">日時</th>
                  <th className="text-left py-2 px-4">種別</th>
                  <th className="text-left py-2 px-4">商品</th>
                  <th className="text-left py-2 px-4">倉庫</th>
                  <th className="text-left py-2 px-4">数量</th>
                </tr>
              </thead>
              <tbody>
                {summary.recent_transactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-sm">
                      {new Date(tx.created_at).toLocaleString('ja-JP')}
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          tx.type === 'in'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tx.type === 'in' ? '入庫' : '出庫'}
                      </span>
                    </td>
                    <td className="py-2 px-4">{tx.product?.name}</td>
                    <td className="py-2 px-4">{tx.warehouse?.name}</td>
                    <td className="py-2 px-4">{tx.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 py-4">入出庫履歴がありません</div>
        )}
      </div>
    </div>
  );
}
