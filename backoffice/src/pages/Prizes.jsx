import { useState } from 'react';
import { useForm } from 'react-hook-form';
import MainLayout from '../components/Layout/MainLayout';
import Modal from '../components/UI/Modal';
import FileUploader from '../components/UI/FileUploader';
import { useFetch, useCreate, useUpdate, useDelete } from '../hooks/useFetch';
import api from '../api/axios';

const Prizes = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);
  const [imagePath, setImagePath] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, system, users
  const { register, handleSubmit, reset, setValue } = useForm();

  const { data: prizes, isLoading } = useFetch('prizes', async () => {
    const res = await api.get('/admin/prizes');
    return res.data.data.prizes;
  });

  const createMutation = useCreate('prizes', async (data) => {
    await api.post('/admin/prizes', data);
  });

  const updateMutation = useUpdate('prizes', async ({ id, data }) => {
    await api.put(`/admin/prizes/${id}`, data);
  });

  const deleteMutation = useDelete('prizes', async (id) => {
    await api.delete(`/admin/prizes/${id}`);
  });

  const resetPrizesMutation = useCreate('prizes', async () => {
    await api.post('/admin/prizes/reset');
  });

  const openModal = (prize = null) => {
    if (prize) {
      setEditingPrize(prize);
      setValue('title', prize.title);
      setValue('description', prize.description);
      setValue('weight', prize.weight);
      setValue('category', prize.category);
      setValue('isDefault', prize.isDefault);
      setImagePath(prize.imagePath);
    } else {
      setEditingPrize(null);
      reset();
      setImagePath(null);
      setValue('isDefault', true); // Por defecto, los del admin son de sistema
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPrize(null);
    setImagePath(null);
    reset();
  };

  const onSubmit = async (data) => {
    const prizeData = {
      ...data,
      imagePath,
      weight: parseInt(data.weight),
      userId: data.isDefault ? null : undefined, // null = sistema
    };

    if (editingPrize) {
      await updateMutation.mutateAsync({ id: editingPrize._id, data: prizeData });
    } else {
      await createMutation.mutateAsync(prizeData);
    }
    closeModal();
  };

  const handleDelete = async (prize) => {
    if (window.confirm('¿Estás seguro de eliminar este premio?')) {
      await deleteMutation.mutateAsync(prize._id);
    }
  };

  const handleResetPrizes = async () => {
    if (window.confirm('¿Estás seguro de marcar todos los premios del sistema como no usados?')) {
      await resetPrizesMutation.mutateAsync();
    }
  };

  // Filtrar premios
  const filteredPrizes = prizes?.filter(prize => {
    if (filterType === 'system') return prize.isDefault;
    if (filterType === 'users') return !prize.isDefault;
    return true;
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Premios</h1>
            <p className="text-gray-600 mt-2">Gestiona los premios del sistema</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleResetPrizes}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🔄 Reiniciar Sistema
            </button>
            <button
              onClick={() => openModal()}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              ➕ Nuevo Premio
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex space-x-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos ({prizes?.length || 0})
          </button>
          <button
            onClick={() => setFilterType('system')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'system'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sistema ({prizes?.filter(p => p.isDefault).length || 0})
          </button>
          <button
            onClick={() => setFilterType('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'users'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Usuarios ({prizes?.filter(p => !p.isDefault).length || 0})
          </button>
        </div>

        {/* Grid de premios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrizes?.map((prize) => (
            <div
              key={prize._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center relative">
                {prize.imagePath ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${prize.imagePath}`}
                    alt={prize.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">🏆</span>
                )}
                {prize.isDefault && (
                  <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Sistema
                  </span>
                )}
                {!prize.isDefault && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Usuario
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold">{prize.title}</h3>
                  {prize.used && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                      Usado
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4">{prize.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Peso: {prize.weight}/10</span>
                  <span>{prize.category}</span>
                </div>
                {prize.isDefault && (
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => openModal(prize)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors text-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(prize)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors text-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                )}
                {!prize.isDefault && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    <span>Creado por usuario</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingPrize ? 'Editar Premio' : 'Nuevo Premio'}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                {...register('title', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                placeholder="Cena Romántica 🍝"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                {...register('description', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                rows="4"
                placeholder="Descripción detallada del premio"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (1-10)
                </label>
                <input
                  {...register('weight', { required: true, min: 1, max: 10 })}
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="5"
                  defaultValue={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  {...register('category')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="comida, viaje..."
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isDefault')}
                className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Premio del sistema (disponible para todos los usuarios)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen
              </label>
              <FileUploader
                currentImage={imagePath}
                onUploadComplete={setImagePath}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                {editingPrize ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Prizes;