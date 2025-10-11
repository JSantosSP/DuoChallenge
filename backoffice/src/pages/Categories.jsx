import { useState } from 'react';
import { useForm } from 'react-hook-form';
import MainLayout from '../components/Layout/MainLayout';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { useFetch, useCreate, useUpdate, useDelete } from '../hooks/useFetch';
import api from '../api/axios';

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const { data: categories, isLoading } = useFetch('categories', async () => {
    const res = await api.get('/admin/categories');
    return res.data.data.categories;
  });

  const createMutation = useCreate('categories', async (data) => {
    await api.post('/admin/categories', data);
  });

  const updateMutation = useUpdate('categories', async ({ id, data }) => {
    await api.put(`/admin/categories/${id}`, data);
  });

  const deleteMutation = useDelete('categories', async (id) => {
    await api.delete(`/admin/categories/${id}`);
  });

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setValue('name', category.name);
      setValue('description', category.description);
      setValue('active', category.active);
    } else {
      setEditingCategory(null);
      reset({ active: true });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory._id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      closeModal();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error al guardar la categoría');
    }
  };

  const handleDelete = async (category) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(category._id);
      } catch (error) {
        alert(error.response?.data?.message || 'Error al eliminar la categoría');
      }
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Nombre',
      render: (row) => (
        <span className="font-semibold text-gray-800">{row.name}</span>
      )
    },
    { 
      key: 'description', 
      label: 'Descripción',
      render: (row) => (
        <span className="text-gray-600 text-sm">{row.description || '—'}</span>
      )
    },
    { 
      key: 'active', 
      label: 'Estado',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {row.active ? '✓ Activa' : '✕ Inactiva'}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Creada',
      render: (row) => new Date(row.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Categorías</h1>
            <p className="text-gray-600 mt-2">
              Gestiona las categorías para organizar las plantillas de niveles
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            ➕ Nueva Categoría
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">
              Total: <span className="font-semibold text-gray-800">{categories?.length || 0}</span> categorías
            </span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={categories}
          loading={isLoading}
          onEdit={openModal}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name', { 
                  required: 'El nombre es requerido',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Fechas especiales"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                {...register('description')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Descripción de la categoría..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('active')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                id="active"
              />
              <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                Categoría activa
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
              >
                {editingCategory ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Categories;
