import { useState } from 'react';
import { useForm } from 'react-hook-form';
import MainLayout from '../components/Layout/MainLayout';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { useFetch, useCreate, useUpdate, useDelete } from '../hooks/useFetch';
import api from '../api/axios';

const Variables = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const { data: variables, isLoading } = useFetch('variables', async () => {
    const res = await api.get('/admin/variables');
    return res.data.data.variables;
  });

  const createMutation = useCreate('variables', async (data) => {
    await api.post('/admin/variables', data);
  });

  const updateMutation = useUpdate('variables', async ({ id, data }) => {
    await api.put(`/admin/variables/${id}`, data);
  });

  const deleteMutation = useDelete('variables', async (id) => {
    await api.delete(`/admin/variables/${id}`);
  });

  const openModal = (variable = null) => {
    if (variable) {
      setEditingVariable(variable);
      Object.keys(variable).forEach(key => {
        setValue(key, variable[key]);
      });
    } else {
      setEditingVariable(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVariable(null);
    reset();
  };

  const onSubmit = async (data) => {
    if (editingVariable) {
      await updateMutation.mutateAsync({ id: editingVariable._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    closeModal();
  };

  const handleDelete = async (variable) => {
    if (window.confirm('¿Estás seguro de eliminar esta variable?')) {
      await deleteMutation.mutateAsync(variable._id);
    }
  };

  const columns = [
    { 
      key: 'key', 
      label: 'Clave',
      render: (row) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {row.key}
        </span>
      )
    },
    { key: 'value', label: 'Valor' },
    { 
      key: 'type', 
      label: 'Tipo',
      render: (row) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
          {row.type}
        </span>
      )
    },
    { key: 'category', label: 'Categoría' },
    { key: 'description', label: 'Descripción' }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Variables</h1>
            <p className="text-gray-600 mt-2">Gestiona las variables personalizadas del juego</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ➕ Nueva Variable
          </button>
        </div>

        <DataTable
          columns={columns}
          data={variables}
          loading={isLoading}
          onEdit={openModal}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingVariable ? 'Editar Variable' : 'Nueva Variable'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clave (sin espacios, usar guiones bajos)
              </label>
              <input
                {...register('key', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                placeholder="primera_cita"
                disabled={!!editingVariable}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor
              </label>
              <input
                {...register('value', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="2020-06-15"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  {...register('type', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="date">Fecha</option>
                  <option value="text">Texto</option>
                  <option value="location">Lugar</option>
                  <option value="number">Número</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <input
                  {...register('category')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="fechas, lugares..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                {...register('description')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows="3"
                placeholder="Descripción de la variable"
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
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {editingVariable ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Variables;