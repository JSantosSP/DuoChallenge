import { useState } from 'react';
import { useForm } from 'react-hook-form';
import MainLayout from '../components/Layout/MainLayout';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { useFetch, useCreate, useUpdate, useDelete } from '../hooks/useFetch';
import api from '../api/axios';

const Templates = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const selectedType = watch('type');

  const { data: templates, isLoading } = useFetch('templates', async () => {
    const res = await api.get('/admin/templates');
    return res.data.data.templates;
  });

  const createMutation = useCreate('templates', async (data) => {
    await api.post('/admin/templates', data);
  });

  const updateMutation = useUpdate('templates', async ({ id, data }) => {
    await api.put(`/admin/templates/${id}`, data);
  });

  const deleteMutation = useDelete('templates', async (id) => {
    await api.delete(`/admin/templates/${id}`);
  });

  const openModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setValue('type', template.type);
      setValue('title', template.title);
      setValue('questionTemplate', template.questionTemplate);
      setValue('variables', template.variables?.join(', ') || '');
      setValue('hintsTemplate', template.hintsTemplate?.join('\n') || '');
      setValue('difficulty', template.difficulty);
      setValue('category', template.category);
      setValue('answerExample', template.answerExample || '');
    } else {
      setEditingTemplate(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    reset();
  };

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      variables: data.variables.split(',').map(v => v.trim()).filter(Boolean),
      hintsTemplate: data.hintsTemplate.split('\n').filter(Boolean),
      answerExample: data.answerExample || null
    };

    if (editingTemplate) {
      await updateMutation.mutateAsync({ id: editingTemplate._id, data: formattedData });
    } else {
      await createMutation.mutateAsync(formattedData);
    }
    closeModal();
  };

  const handleDelete = async (template) => {
    if (window.confirm('¿Estás seguro de eliminar esta plantilla?')) {
      await deleteMutation.mutateAsync(template._id);
    }
  };

  const columns = [
    { key: 'title', label: 'Título' },
    { 
      key: 'type', 
      label: 'Tipo',
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {row.type}
        </span>
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
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${colors[row.difficulty]}`}>
            {row.difficulty}
          </span>
        );
      }
    },
    { 
      key: 'variables', 
      label: 'Variables',
      render: (row) => row.variables?.length || 0
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Plantillas de Retos</h1>
            <p className="text-gray-600 mt-2">Gestiona las plantillas para generar retos</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ➕ Nueva Plantilla
          </button>
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
          title={editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                {...register('title', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Primera Cita"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  {...register('type', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Texto (nombres, apodos, lugares, canciones, etc.)</option>
                  <option value="date">Fecha</option>
                  <option value="photo">Foto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dificultad
                </label>
                <select
                  {...register('difficulty', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Fácil</option>
                  <option value="medium">Medio</option>
                  <option value="hard">Difícil</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pregunta (usa {`{{variable}}`} para variables)
              </label>
              <textarea
                {...register('questionTemplate', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="¿Qué fecha fue {{evento}}?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variables (separadas por comas)
              </label>
              <input
                {...register('variables')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="evento, lugar, fecha"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pistas (una por línea)
              </label>
              <textarea
                {...register('hintsTemplate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Primera pista&#10;Segunda pista&#10;Tercera pista"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ejemplo de Respuesta (opcional - solo para retos de texto)
              </label>
              <input
                {...register('answerExample')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: París, María, etc."
                disabled={selectedType === 'date'}
              />
              {selectedType !== 'date' && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Ayuda visual para saber qué formato de respuesta se espera en retos tipo texto
                </p>
              )}
              {selectedType === 'date' && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    📅 Retos de tipo fecha:
                  </p>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>El jugador elegirá la fecha usando un selector de calendario</li>
                    <li>No se permite entrada manual de texto</li>
                    <li>El formato esperado por el backend es YYYY-MM-DD</li>
                    <li>Ejemplo de respuesta correcta: 2020-06-15</li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <input
                {...register('category')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="fechas, lugares, personal..."
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
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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

export default Templates;