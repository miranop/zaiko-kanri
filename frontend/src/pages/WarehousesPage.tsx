import { useEffect, useState } from 'react';
import { warehouseApi } from '../services/api';
import type { Warehouse, CreateWarehouseRequest } from '../types';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';

export function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const [form, setForm] = useState<CreateWarehouseRequest>({
    name: '',
    location: '',
  });

  const fetchData = async () => {
    try {
      const data = await warehouseApi.getAll();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await warehouseApi.update(editingWarehouse.id, form);
      } else {
        await warehouseApi.create(form);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save warehouse:', error);
      alert('保存に失敗しました');
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setForm({
      name: warehouse.name,
      location: warehouse.location || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この倉庫を削除しますか？')) return;
    try {
      await warehouseApi.delete(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete warehouse:', error);
      alert('削除に失敗しました');
    }
  };

  const resetForm = () => {
    setEditingWarehouse(null);
    setForm({
      name: '',
      location: '',
    });
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const columns = [
    { key: 'name', header: '倉庫名' },
    { key: 'location', header: '所在地', render: (w: Warehouse) => w.location || '-' },
    {
      key: 'actions',
      header: '操作',
      render: (warehouse: Warehouse) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(warehouse)}
            className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            編集
          </button>
          <button
            onClick={() => handleDelete(warehouse.id)}
            className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            削除
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">倉庫管理</h1>
        <button
          onClick={openNewModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          新規登録
        </button>
      </div>

      <Table columns={columns} data={warehouses} keyExtractor={(w) => w.id} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? '倉庫編集' : '倉庫登録'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              倉庫名 *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              所在地
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingWarehouse ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
