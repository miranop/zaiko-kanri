import { useEffect, useState } from 'react';
import { stockApi, productApi, warehouseApi } from '../services/api';
import type { Stock, Product, Warehouse, Transaction, StockMovementRequest } from '../types';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';

export function StockPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'in' | 'out'>('in');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState<'stock' | 'transactions'>('stock');

  const [form, setForm] = useState<StockMovementRequest>({
    product_id: 0,
    warehouse_id: 0,
    quantity: 1,
    note: '',
  });

  const fetchData = async () => {
    try {
      const [stocksData, transactionsData, productsData, warehousesData] = await Promise.all([
        stockApi.getAll({
          search: searchTerm || undefined,
          warehouse_id: selectedWarehouse || undefined,
        }),
        stockApi.getTransactions({ limit: 50 }),
        productApi.getAll(),
        warehouseApi.getAll(),
      ]);
      setStocks(stocksData);
      setTransactions(transactionsData);
      setProducts(productsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedWarehouse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'in') {
        await stockApi.stockIn(form);
      } else {
        await stockApi.stockOut(form);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to process stock movement:', error);
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || '処理に失敗しました');
    }
  };

  const resetForm = () => {
    setForm({
      product_id: 0,
      warehouse_id: 0,
      quantity: 1,
      note: '',
    });
  };

  const openModal = (type: 'in' | 'out') => {
    resetForm();
    setModalType(type);
    setIsModalOpen(true);
  };

  const stockColumns = [
    {
      key: 'product',
      header: '商品',
      render: (stock: Stock) => (
        <div>
          <div className="font-medium">{stock.product?.name}</div>
          <div className="text-sm text-gray-500">{stock.product?.code}</div>
        </div>
      ),
    },
    {
      key: 'warehouse',
      header: '倉庫',
      render: (stock: Stock) => stock.warehouse?.name,
    },
    {
      key: 'quantity',
      header: '数量',
      render: (stock: Stock) => (
        <span className={stock.quantity <= 10 ? 'text-red-600 font-bold' : ''}>
          {stock.quantity} {stock.product?.unit}
        </span>
      ),
    },
    {
      key: 'updated_at',
      header: '更新日時',
      render: (stock: Stock) => new Date(stock.updated_at).toLocaleString('ja-JP'),
    },
  ];

  const transactionColumns = [
    {
      key: 'created_at',
      header: '日時',
      render: (tx: Transaction) => new Date(tx.created_at).toLocaleString('ja-JP'),
    },
    {
      key: 'type',
      header: '種別',
      render: (tx: Transaction) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            tx.type === 'in'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {tx.type === 'in' ? '入庫' : '出庫'}
        </span>
      ),
    },
    {
      key: 'product',
      header: '商品',
      render: (tx: Transaction) => tx.product?.name,
    },
    {
      key: 'warehouse',
      header: '倉庫',
      render: (tx: Transaction) => tx.warehouse?.name,
    },
    {
      key: 'quantity',
      header: '数量',
      render: (tx: Transaction) => `${tx.quantity} ${tx.product?.unit || ''}`,
    },
    {
      key: 'note',
      header: '備考',
      render: (tx: Transaction) => tx.note || '-',
    },
    {
      key: 'user',
      header: '担当者',
      render: (tx: Transaction) => tx.user?.username,
    },
  ];

  if (loading) {
    return <div className="text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">在庫管理</h1>
        <div className="flex gap-2">
          <button
            onClick={() => openModal('in')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            入庫
          </button>
          <button
            onClick={() => openModal('out')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            出庫
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'stock'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          在庫一覧
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'transactions'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          入出庫履歴
        </button>
      </div>

      {activeTab === 'stock' && (
        <>
          {/* Filters */}
          <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
            <input
              type="text"
              placeholder="商品名・コードで検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedWarehouse}
              onChange={(e) =>
                setSelectedWarehouse(e.target.value ? Number(e.target.value) : '')
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全倉庫</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>

          <Table columns={stockColumns} data={stocks} keyExtractor={(s) => s.id} />
        </>
      )}

      {activeTab === 'transactions' && (
        <Table
          columns={transactionColumns}
          data={transactions}
          keyExtractor={(t) => t.id}
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'in' ? '入庫登録' : '出庫登録'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品 *
            </label>
            <select
              value={form.product_id || ''}
              onChange={(e) =>
                setForm({ ...form, product_id: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">選択してください</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              倉庫 *
            </label>
            <select
              value={form.warehouse_id || ''}
              onChange={(e) =>
                setForm({ ...form, warehouse_id: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">選択してください</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              数量 *
            </label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-lg ${
                modalType === 'in'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {modalType === 'in' ? '入庫登録' : '出庫登録'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
