import MainLayout from '../components/Layout/MainLayout';
import { useFetch } from '../hooks/useFetch';
import api from '../api/axios';

const Stats = () => {
  const { data: stats, isLoading } = useFetch('stats', async () => {
    const res = await api.get('/admin/stats');
    return res.data.data;
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Estadísticas Completas</h1>
          <p className="text-gray-600 mt-2">Vista detallada de todas las métricas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">👤</span> Usuarios
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold">{stats?.users?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Jugadores:</span>
                <span className="font-bold">{stats?.users?.players || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Administradores:</span>
                <span className="font-bold">{stats?.users?.admins || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">🧩</span> Plantillas
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold">{stats?.templates?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activas:</span>
                <span className="font-bold text-green-600">{stats?.templates?.active || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">🏆</span> Premios
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold">{stats?.prizes?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Usados:</span>
                <span className="font-bold text-red-600">{stats?.prizes?.used || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Disponibles:</span>
                <span className="font-bold text-green-600">{stats?.prizes?.available || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">🔗</span> Compartidos
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Códigos Activos:</span>
                <span className="font-bold text-green-600">{stats?.shares?.active || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Generados:</span>
                <span className="font-bold">{stats?.shares?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Usados:</span>
                <span className="font-bold text-blue-600">{stats?.shares?.used || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">🎮</span> Niveles
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold">{stats?.levels?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completados:</span>
                <span className="font-bold text-green-600">{stats?.levels?.completed || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">📦</span> Sets de Juego
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold">{stats?.gameSets?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completados:</span>
                <span className="font-bold">{stats?.gameSets?.completed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activos:</span>
                <span className="font-bold text-blue-600">{stats?.gameSets?.active || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">📝</span> Variables
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold">{stats?.variables?.total || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Stats;