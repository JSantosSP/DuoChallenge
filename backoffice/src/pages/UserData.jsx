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
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Datos de Usuarios</h1>
          <p className="text-gray-600 mt-2">
            Visualiza los datos personalizados que han creado los usuarios
          </p>
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