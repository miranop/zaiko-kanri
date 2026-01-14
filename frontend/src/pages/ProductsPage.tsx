import { useEffect, useState } from 'react';
import { productApi, categoryApi } from '../services/api';
import type { Product, Category, CreateProductRequest } from '../types';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');

  const [form, setForm] = useState<CreateProductRequest>({
    code: '',
    name: '',
    description: '',
    category_id: 0,
    unit: '個',
  });

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productApi.getAll({
          search: searchTerm || undefined,
          category_id: selectedCategory || undefined,
        }),
        categoryApi.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, form);
      } else {
        await productApi.create(form);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('保存に失敗しました');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      code: product.code,
      name: product.name,
      description: product.description || '',
      category_id: product.category_id || 0,
      unit: product.unit,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この商品を削除しますか？')) return;
    try {
      await productApi.delete(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('削除に失敗しました');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({
      code: '',
      name: '',
      description: '',
      category_id: 0,
      unit: '個',
    });
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const columns = [
    { key: 'code', header: '商品コード' },
    { key: 'name', header: '商品名' },
    {
      key: 'category',
      header: 'カテゴリ',
      render: (product: Product) => product.category?.name || '-',
    },
    { key: 'unit', header: '単位' },
    {
      key: 'actions',
      header: '操作',
      render: (product: Product) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(product)}
            className="px-2 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            編集
          </button>
          <button
            onClick={() => handleDelete(product.id)}
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
        <h1 className="text-2xl font-bold">商品管理</h1>
        <button
          onClick={openNewModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          新規登録
        </button>
      </div>

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
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全カテゴリ</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Table columns={columns} data={products} keyExtractor={(p) => p.id} />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? '商品編集' : '商品登録'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品コード *
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              商品名 *
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
              説明
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <select
              value={form.category_id || ''}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">未選択</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              単位 *
            </label>
            <input
              type="text"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
              {editingProduct ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
