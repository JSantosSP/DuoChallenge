import { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import DataTable from '../components/UI/DataTable';
import { useFetch } from '../hooks/useFetch';
import api from '../api/axios';

const GeneratedLevels = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const { data: levels, isLoading } = useFetch('generatedLevels', async () => {
    const res = await api.get('/admin/levels');
    return res.data.data.levels;
  });

  const columns = [
    { 
      key: 'title', 
      label: 'Título',
      render: (row) => (
        <div>
          <span className="font-semibold text-gray-800">{row.title}</span>
          <p className="text-xs text-gray-500 mt-1">{row.description || '—'}</p>
        </div>
      )
    },
    { 
      key: 'userId', 
      label: 'Usuario',
      render: (row) => (
        <div>
          <span className="text-sm text-gray-800">{row.userId?.name || 'N/A'}</span>
          <p className="text-xs text-gray-500">{row.userId?.email || ''}</p>
        </div>
      )
    },
    { 
      key: 'order', 
      label: 'Orden',
      render: (row) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          #{row.order}
        </span>
      )
    },
    { 
      key: 'challenges', 
      label: 'Retos',
      render: (row) => (
        <span className="text-sm text-gray-700">
          {row.challenges?.length || 0} reto(s)
        </span>
      )
    },
    { 
      key: 'completed', 
      label: 'Estado',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.completed 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {row.completed ? '✓ Completado' : '⏳ En progreso'}
        </span>
      )
    },
    { 
      key: 'completedAt', 
      label: 'Completado',
      render: (row) => row.completedAt 
        ? new Date(row.completedAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : '—'
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <button
          onClick={() => setSelectedLevel(row)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Ver detalles
        </button>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Niveles Generados</h1>
          <p className="text-gray-600 mt-2">
            Visualiza los niveles generados automáticamente a partir de los datos de usuarios
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>Esta sección es de solo lectura. Los niveles se generan automáticamente.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Total Niveles</div>
            <div className="text-2xl font-bold text-gray-800">{levels?.length || 0}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Completados</div>
            <div className="text-2xl font-bold text-green-600">
              {levels?.filter(l => l.completed).length || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">En Progreso</div>
            <div className="text-2xl font-bold text-yellow-600">
              {levels?.filter(l => !l.completed).length || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600 mb-1">Total Retos</div>
            <div className="text-2xl font-bold text-blue-600">
              {levels?.reduce((sum, l) => sum + (l.challenges?.length || 0), 0) || 0}
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={levels}
          loading={isLoading}
        />

        {/* Modal de detalles */}
        {selectedLevel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedLevel.title}</h2>
                    <p className="text-gray-600 mt-1">{selectedLevel.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedLevel(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Usuario:</span>
                    <p className="font-medium text-gray-800">{selectedLevel.userId?.name}</p>
                    <p className="text-sm text-gray-500">{selectedLevel.userId?.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Estado:</span>
                    <p className={`font-medium ${selectedLevel.completed ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedLevel.completed ? 'Completado' : 'En progreso'}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600">Orden:</span>
                  <p className="font-medium text-gray-800">Nivel #{selectedLevel.order}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-600 mb-2 block">Retos asociados:</span>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedLevel.challenges?.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedLevel.challenges.map((challenge, idx) => (
                          <li key={challenge._id || idx} className="flex items-start gap-2">
                            <span className="text-blue-600 font-mono text-sm">#{idx + 1}</span>
                            <div>
                              <p className="text-sm text-gray-800">{challenge.question || 'Sin pregunta'}</p>
                              <p className="text-xs text-gray-500">
                                Tipo: {challenge.type} | 
                                {challenge.completed ? ' ✓ Completado' : ' ⏳ Pendiente'}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">Sin retos asociados</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Creado:</span>
                    <p className="text-gray-800">
                      {new Date(selectedLevel.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                  {selectedLevel.completedAt && (
                    <div>
                      <span className="text-gray-600">Completado:</span>
                      <p className="text-gray-800">
                        {new Date(selectedLevel.completedAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedLevel(null)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default GeneratedLevels;
