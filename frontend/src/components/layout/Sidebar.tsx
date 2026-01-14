import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { path: '/', label: 'ダッシュボード', icon: '📊' },
  { path: '/products', label: '商品管理', icon: '📦' },
  { path: '/warehouses', label: '倉庫管理', icon: '🏭' },
  { path: '/stock', label: '在庫管理', icon: '📋' },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">在庫管理システム</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{user?.username}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>
    </aside>
  );
}
