import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard', section: 'main' },
    { path: '/categories', icon: '📁', label: 'Categorías', section: 'config' },
    { path: '/variables', icon: '📝', label: 'Variables', section: 'config' },
    { path: '/users', icon: '👤', label: 'Usuarios', section: 'management' },
    { path: '/userdata', icon: '💾', label: 'Datos Usuarios', section: 'view' }, 
    { path: '/prizes', icon: '🏆', label: 'Premios del Sistema', section: 'config' },
    { path: '/stats', icon: '📊', label: 'Estadísticas', section: 'main' }
  ];

  const sections = [
    { key: 'main', label: 'Principal' },
    { key: 'config', label: 'Configuración' },
    { key: 'view', label: 'Consulta' },
    { key: 'management', label: 'Gestión' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">🎮 DuoChallenge</h1>
        <p className="text-sm text-gray-400 mt-1">Panel Admin</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-lg">👑</span>
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.key} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">
              {section.label}
            </h3>
            <ul className="space-y-1">
              {menuItems.filter(item => item.section === section.key).map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                      isActive(item.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;