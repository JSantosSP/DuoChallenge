import { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { useFetch } from '../hooks/useFetch';
import api from '../api/axios';

const UserDataPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const { data: users, isLoading } = useFetch('users', async () => {
    const res = await api.get('/admin/users');
    return res.data.data.users;
  });

  const viewUserData = async (user) => {
    setSelectedUser(user);
    setLoadingData(true);
    setIsModalOpen(true);

    try {
      // Hacer petición como ese usuario (necesitarás un endpoint en el backend)
      const res = await api.get(`/admin/users/${user._id}/userdata`);
      setUserData(res.data.data.userData);
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      setUserData([]);
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Rol',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.role === 'admin' 
            ? 'bg-purple-100 text-purple-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {row.role === 'admin' ? '👑 Admin' : '🎮 Jugador'}
        </span>
      )
    },
  ];

  const toggleActive = async (dataId) => {
    try {
      await api.patch(`/admin/userdata/${dataId}/toggle`);
      // Recargar los datos del usuario
      const res = await api.get(`/admin/users/${selectedUser._id}/userdata`);
      setUserData(res.data.data.userData);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del dato');
    }
  };

  const userDataColumns = [
    { 
      key: 'tipoDato', 
      label: 'Tipo',
      render: (row) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {row.tipoDato}
        </span>
      )
    },
    { key: 'pregunta', label: 'Pregunta' },
    { key: 'valor', label: 'Respuesta' },
    {
      key: 'pistas',
      label: 'Pistas',
      render: (row) => row.pistas?.length || 0
    },
    {
      key: 'categorias',
      label: 'Categorías',
      render: (row) => row.categorias?.join(', ') || '-'
    },
    {
      key: 'active',
      label: 'Estado',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-600'
        }`}>
          {row.active ? '✓ Activo' : '✕ Inactivo'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <button
          onClick={() => toggleActive(row._id)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            row.active
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {row.active ? 'Desactivar' : 'Activar'}
        </button>
      )
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Datos de Usuarios</h1>
          <p className="text-gray-600 mt-2">
            Visualiza y gestiona los datos personalizados que han creado los usuarios
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Puedes activar o desactivar datos para resolver problemas con usuarios.</span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={users?.filter(u => u.role === 'player')}
          loading={isLoading}
          onEdit={viewUserData}
          onDelete={() => {}}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Datos de ${selectedUser?.name}`}
          size="xl"
        >
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : userData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {userDataColumns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {userDataColumns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm">
                          {column.render ? column.render(row) : row[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Este usuario no tiene datos personalizados aún</p>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default UserDataPage;