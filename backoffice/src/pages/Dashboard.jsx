import { useFetch } from '../hooks/useFetch';
import api from '../api/axios';
import MainLayout from '../components/Layout/MainLayout';

const Dashboard = () => {
  const { data: stats, isLoading } = useFetch('stats', async () => {
    const res = await api.get('/admin/stats');
    return res.data.data;
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-medium"></div>
        </div>
      </MainLayout>
    );
  }

  const cards = [
    {
      title: 'Usuarios',
      value: stats?.users?.total || 0,
      subtitle: `${stats?.users?.players || 0} jugadores, ${stats?.users?.admins || 0} admins`,
      icon: '👤',
      color: 'bg-ocean-medium'
    },
    {
      title: 'Plantillas',
      value: stats?.templates?.total || 0,
      subtitle: `${stats?.templates?.active || 0} activas`,
      icon: '🧩',
      color: 'bg-forest-medium'
    },
    {
      title: 'Premios',
      value: stats?.prizes?.total || 0,
      subtitle: `${stats?.prizes?.available || 0} disponibles`,
      icon: '🏆',
      color: 'bg-ocean-light'
    },
    {
      title: 'Juegos Completados',
      value: stats?.gameSets?.completed || 0,
      subtitle: `${stats?.gameSets?.active || 0} activos`,
      icon: '✅',
      color: 'bg-forest-light'
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-forest-dark">Dashboard</h1>
          <p className="text-muted mt-2">Resumen general del sistema</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>
                </div>
                <div className={`${card.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estadísticas adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🎮 Sets de Juego</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-bold">{stats?.gameSets?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completados</span>
                <span className="font-bold">{stats?.gameSets?.completed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activos</span>
                <span className="font-bold text-green-600">{stats?.gameSets?.active || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">📝 Variables</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Variables</span>
                <span className="font-bold">{stats?.variables?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Niveles Totales</span>
                <span className="font-bold">{stats?.levels?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Niveles Completados</span>
                <span className="font-bold text-green-600">{stats?.levels?.completed || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;