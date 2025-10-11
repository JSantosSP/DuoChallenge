import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import MainLayout from '../components/Layout/MainLayout';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { useFetch, useCreate, useUpdate, useDelete } from '../hooks/useFetch';
import api from '../api/axios';

const LevelTemplates = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const { data: templates, isLoading } = useFetch('levelTemplates', async () => {
    const res = await api.get('/admin/level-templates');
    return res.data.data.templates;
  });

  const { data: categories } = useFetch('categories', async () => {
    const res = await api.get('/admin/categories');
    return res.data.data.categories;
  });

  const createMutation = useCreate('levelTemplates', async (data) => {
    await api.post('/admin/level-templates', data);
  });

  const updateMutation = useUpdate('levelTemplates', async ({ id, data }) => {
    await api.put(`/admin/level-templates/${id}`, data);
  });

  const deleteMutation = useDelete('levelTemplates', async (id) => {
    await api.delete(`/admin/level-templates/${id}`);
  });

  const dataTypes = [
    { value: 'nombre', label: 'Nombre' },
    { value: 'foto', label: 'Foto' },
    { value: 'fecha', label: 'Fecha' },
    { value: 'lugar', label: 'Lugar' },
    { value: 'texto', label: 'Texto' },
    { value: 'numero', label: 'Número' },
    { value: 'telefono', label: 'Teléfono' },
    { value: 'email', label: 'Email' },
    { value: 'otro', label: 'Otro' }
  ];

  const openModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setValue('name', template.name);
      setValue('description', template.description);
      setValue('categoryId', template.categoryId?._id || template.categoryId);
      setValue('dataType', template.dataType);
      setValue('challengesPerLevel', template.challengesPerLevel);
      setValue('difficulty', template.difficulty);
      setValue('order', template.order);
      setValue('active', template.active);
    } else {
      setEditingTemplate(null);
      reset({
        challengesPerLevel: 3,
        difficulty: 'medium',
        order: 0,
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        challengesPerLevel: parseInt(data.challengesPerLevel),
        order: parseInt(data.order)
      };

      if (editingTemplate) {
        await updateMutation.mutateAsync({ id: editingTemplate._id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      closeModal();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error al guardar la plantilla');
    }
  };

  const handleDelete = async (template) => {
    if (window.confirm(`¿Estás seguro de eliminar la plantilla "${template.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(template._id);
      } catch (error) {
        alert(error.response?.data?.message || 'Error al eliminar la plantilla');
      }
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Nombre',
      render: (row) => (
        <div>
          <span className="font-semibold text-gray-800">{row.name}</span>
          <p className="text-xs text-gray-500 mt-1">{row.description || '—'}</p>
        </div>
      )
    },
    { 
      key: 'categoryId', 
      label: 'Categoría',
      render: (row) => (
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
          {row.categoryId?.name || 'Sin categoría'}
        </span>
      )
    },
    { 
      key: 'dataType', 
      label: 'Tipo de Dato',
      render: (row) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {dataTypes.find(dt => dt.value === row.dataType)?.label || row.dataType}
        </span>
      )
    },
    { 
      key: 'challengesPerLevel', 
      label: 'Retos',
      render: (row) => (
        <span className="font-semibold text-gray-700">{row.challengesPerLevel}</span>
      )
    },
    { 
      key: 'difficulty', 
      label: 'Dificultad',
      render: (row) => {
        const colors = {
          easy: 'bg-green-100 text-green-800',
          medium: 'bg-yellow-100 text-yellow-800',
          hard: 'bg-red-100 text-red-800'
        };
        const labels = {
          easy: 'Fácil',
          medium: 'Medio',
          hard: 'Difícil'
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[row.difficulty]}`}>
            {labels[row.difficulty]}
          </span>
        );
      }
    },
    { 
      key: 'active', 
      label: 'Estado',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.active 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {row.active ? '✓' : '✕'}
        </span>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Plantillas de Nivel</h1>
            <p className="text-gray-600 mt-2">
              Define las plantillas que se usarán para generar niveles automáticamente
            </p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
          >
            ➕ Nueva Plantilla
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">
              Total: <span className="font-semibold text-gray-800">{templates?.length || 0}</span> plantillas
            </span>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={templates}
          loading={isLoading}
          onEdit={openModal}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingTemplate ? 'Editar Plantilla de Nivel' : 'Nueva Plantilla de Nivel'}
          size="lg"
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
                placeholder="Ej: Nivel de fechas memorables"
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
                rows="2"
                placeholder="Descripción de la plantilla..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('categoryId', { required: 'La categoría es requerida' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {categories?.filter(c => c.active).map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Dato <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('dataType', { required: 'El tipo de dato es requerido' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  {dataTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.dataType && (
                  <p className="text-red-500 text-xs mt-1">{errors.dataType.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retos por Nivel <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register('challengesPerLevel', { 
                    required: 'Campo requerido',
                    min: { value: 1, message: 'Mínimo 1' },
                    max: { value: 10, message: 'Máximo 10' }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="10"
                />
                {errors.challengesPerLevel && (
                  <p className="text-red-500 text-xs mt-1">{errors.challengesPerLevel.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dificultad <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('difficulty', { required: 'Campo requerido' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="easy">Fácil</option>
                  <option value="medium">Medio</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden
                </label>
                <input
                  type="number"
                  {...register('order')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('active')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                id="active"
              />
              <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                Plantilla activa
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
                {editingTemplate ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default LevelTemplates;
