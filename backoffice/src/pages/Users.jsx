import { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { useFetch, useCreate } from '../hooks/useFetch';
import api from '../api/axios';

const Users = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: users, isLoading, refetch } = useFetch('users', async () => {
    const res = await api.get('/admin/users');
    return res.data.data.users;
  });


  const resetProgressMutation = useCreate('users', async (userId) => {
    await api.post(`/admin/users/${userId}/reset`);
  });

  const viewUserDetails = async (user) => {
    const res = await api.get(`/admin/users/${user._id}`);
    setSelectedUser(res.data.data.user);
    setIsModalOpen(true);
  };


  const handleResetProgress = async (user) => {
    if (window.confirm(`¿Reiniciar progreso de ${user.name}? Esto eliminará su progreso actual.`)) {
      await resetProgressMutation.mutateAsync(user._id);
      refetch();
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
    {
      key: 'totalSetsCompleted',
      label: 'Juegos Completados',
      render: (row) => row.totalSetsCompleted || 0
    },
    {
      key: 'createdAt',
      label: 'Registro',
      render: (row) => new Date(row.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  ];

  const CustomActions = ({ row }) => (
    <div className="flex space-x-2">
      <button
        onClick={() => viewUserDetails(row)}
        className="text-blue-600 hover:text-blue-900 text-sm"
      >
        👁️ Ver
      </button>
      <button
        onClick={() => handleResetProgress(row)}
        className="text-orange-600 hover:text-orange-900 text-sm"
      >
        🔄 Reset
      </button>
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Usuarios</h1>
            <p className="text-gray-600 mt-2">Gestiona usuarios y su progreso</p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={users}
          loading={isLoading}
          onEdit={viewUserDetails}
          onDelete={() => {}} // Desactivado
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Detalles de ${selectedUser?.name}`}
          size="lg"
        >
          {selectedUser && (
            <div className="space-y-6">
              {/* Info básica */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold mb-3">Información General</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Rol:</span>
                    <p className="font-medium">{selectedUser.role}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Sets Completados:</span>
                    <p className="font-medium">{selectedUser.totalSetsCompleted || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Fecha de Registro:</span>
                    <p className="font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold mb-3">Estadísticas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Juegos Completados:</span>
                    <span className="font-medium">{selectedUser.totalSetsCompleted || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última actualización:</span>
                    <span className="font-medium">
                      {new Date(selectedUser.updatedAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    handleResetProgress(selectedUser);
                    setIsModalOpen(false);
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg transition-colors"
                >
                  🔄 Reiniciar Progreso
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Users;