# 🔍 Elementos Obsoletos o a Revisar - Mobile DuoChallenge

**Fecha de análisis:** 2025-10-26

## 📌 Resumen

Tras el análisis exhaustivo del código mobile, se han identificado algunos elementos que podrían requerir revisión, limpieza o mejora. Este documento no indica necesariamente que deban eliminarse, sino que merecen atención para optimizar el código.

---

## ⚠️ Elementos a Revisar

### 1. Estados de Loading Duplicados

**Ubicación:** Múltiples pantallas (HomeScreen, GameDetailScreen, etc.)

**Problema:**
- Muchas pantallas implementan su propio estado `loading` y `refreshing`
- Esto genera código duplicado y podría abstraerse

**Sugerencia:**
```javascript
// Crear un hook personalizado
function useRefreshableQuery(queryKey, queryFn) {
  const [refreshing, setRefreshing] = useState(false);
  const { data, isLoading, refetch } = useQuery({ queryKey, queryFn });
  
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  return { data, isLoading, refreshing, onRefresh, refetch };
}
```

---

### 2. Validaciones de Formulario Repetidas

**Ubicación:** `AddEditDataScreen.js`, `EditPrizeScreen.js`

**Problema:**
- Lógica de validación similar en múltiples pantallas
- Podrían extraerse a funciones reutilizables o un hook

**Ejemplo actual:**
```javascript
// En AddEditDataScreen
const validateForm = () => {
  if (!formData.tipoDato) {
    Alert.alert('Error', 'Selecciona un tipo de dato');
    return false;
  }
  // ... más validaciones
}

// En EditPrizeScreen (similar)
const validateForm = () => {
  if (!formData.title.trim()) {
    Alert.alert('Error', 'El título es requerido');
    return false;
  }
  // ... más validaciones
}
```

**Sugerencia:**
```javascript
// utils/validation.js
export const validateRequired = (value, fieldName) => {
  if (!value?.trim()) {
    Alert.alert('Error', `${fieldName} es requerido`);
    return false;
  }
  return true;
};
```

---

### 3. Estilos Duplicados entre Screens

**Ubicación:** Todas las pantallas

**Problema:**
- Muchos estilos comunes se repiten en múltiples archivos
- Especialmente: `container`, `scroll`, `header`, `title`, `subtitle`, `section`

**Ejemplo:**
```javascript
// Repetido en casi todas las screens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.backgroundLight,
  },
  scroll: {
    flex: 1,
  },
  // ... etc
});
```

**Sugerencia:**
- Crear `src/styles/commonStyles.js` con estilos compartidos
- Importar y extender cuando sea necesario

```javascript
// styles/commonStyles.js
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.backgroundLight,
  },
  scroll: {
    flex: 1,
  },
  // ... etc
});

// En las screens
import { commonStyles } from '../styles/commonStyles';
const styles = StyleSheet.create({
  ...commonStyles,
  // estilos específicos de la screen
});
```

---

### 4. Función getImageUrl Duplicada

**Ubicación:** `/config/env.js` y `/api/api.js`

**Problema:**
- `getImageUrl` se define en `env.js`
- Se re-exporta en `api.js`
- Podría simplificarse

**Actual:**
```javascript
// env.js
export const getImageUrl = (imagePath) => { ... }

// api.js
export { getImageUrl } from '../config/env';
```

**Sugerencia:**
- Mantener solo en `env.js` y importar directamente donde se necesite
- O mantener re-export pero documentar claramente por qué

---

### 5. Manejo de Errores Inconsistente

**Ubicación:** Hooks personalizados (`usePrize`, `useShare`, `useUserData`)

**Problema:**
- Algunos usan `try/catch` con `Alert.alert`
- Otros propagan errores
- No hay un patrón consistente

**Ejemplo:**
```javascript
// usePrize.js - muestra alert
const createPrize = async (data) => {
  try {
    // ...
  } catch (error) {
    Alert.alert('Error', 'Error al crear premio');
    return { success: false, message };
  }
};

// useGame.js - usa callbacks de React Query
const verifyMutation = useMutation({
  mutationFn: ({ levelId, payload }) => apiService.verifyLevel(levelId, payload),
  onSuccess: (data) => { /* ... */ },
  onError: (error) => { /* ... */ },
});
```

**Sugerencia:**
- Estandarizar: preferir usar callbacks de React Query (onSuccess/onError)
- O crear un hook `useErrorHandler` centralizado

---

### 6. Refresh Token no Implementado

**Ubicación:** `AuthContext.js`

**Problema:**
- Existe función `refreshAuthToken()` pero no se usa automáticamente
- Cuando el token expira, se hace logout directo
- No se intenta refrescar antes de cerrar sesión

**Sugerencia:**
```javascript
// En el interceptor de respuesta de axios
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar refresh antes de logout
      const refreshed = await refreshAuthToken();
      if (refreshed.success) {
        // Reintentar petición original
        return api.request(error.config);
      }
      // Si falla el refresh, entonces hacer logout
      await logout();
    }
    return Promise.reject(error);
  }
);
```

---

### 7. Códigos de Estado Hardcodeados

**Ubicación:** Múltiples archivos

**Problema:**
- Estados y mensajes están hardcodeados en el código
- Dificulta i18n futura y mantenimiento

**Ejemplo:**
```javascript
// En GameHistoryScreen
const getStatusLabel = (status) => {
  switch (status) {
    case 'completed': return '✓ Completado';
    case 'active': return '⏳ Activo';
    case 'abandoned': return '✕ Abandonado';
    default: return status;
  }
};
```

**Sugerencia:**
```javascript
// constants/gameStatus.js
export const GAME_STATUS = {
  COMPLETED: 'completed',
  ACTIVE: 'active',
  ABANDONED: 'abandoned',
};

export const GAME_STATUS_LABELS = {
  [GAME_STATUS.COMPLETED]: '✓ Completado',
  [GAME_STATUS.ACTIVE]: '⏳ Activo',
  [GAME_STATUS.ABANDONED]: '✕ Abandonado',
};
```

---

### 8. Console.logs en Producción

**Ubicación:** `PrizeScreen.js`, otros archivos

**Problema:**
- Existen `console.log` y `console.error` en el código
- Deberían removerse o condicionarse para producción

**Ejemplo:**
```javascript
// PrizeScreen.js
useEffect(() => {
  console.log('PrizeScreen - Received params:', { gameSetId, shareCode });
}, [gameSetId, shareCode]);
```

**Sugerencia:**
```javascript
// utils/logger.js
export const logger = {
  log: (...args) => {
    if (__DEV__) console.log(...args);
  },
  error: (...args) => {
    if (__DEV__) console.error(...args);
  },
  warn: (...args) => {
    if (__DEV__) console.warn(...args);
  },
};

// Uso
import { logger } from '../utils/logger';
logger.log('Debug info:', data);
```

---

### 9. Magic Numbers en Estilos

**Ubicación:** Todos los archivos de estilos

**Problema:**
- Valores numéricos repetidos sin nombrar (padding: 24, borderRadius: 16, etc.)
- Dificulta mantener consistencia visual

**Ejemplo:**
```javascript
const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 16,
    // ...
  },
  button: {
    padding: 16,
    borderRadius: 12,
    // ...
  },
});
```

**Sugerencia:**
```javascript
// constants/spacing.js
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

// Uso
import { spacing, borderRadius } from '../constants/spacing';
const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
  },
});
```

---

### 10. Falta de Manejo de Errores de Red

**Ubicación:** Hooks y componentes que usan API

**Problema:**
- No hay manejo explícito para errores de red (sin internet, timeout)
- Usuario no recibe feedback claro en estos casos

**Sugerencia:**
```javascript
// En los hooks
const { data, error, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: (failureCount, error) => {
    // No reintentar en errores de red
    if (error.message === 'Network Error') return false;
    return failureCount < 3;
  },
});

// Mostrar mensaje específico
if (error?.message === 'Network Error') {
  return <NetworkErrorComponent onRetry={refetch} />;
}
```

---

### 11. Navegación con Parámetros Implícitos

**Ubicación:** Múltiples screens

**Problema:**
- Algunas pantallas asumen que ciertos parámetros existen sin validar
- Puede causar crashes si se navega incorrectamente

**Ejemplo:**
```javascript
// LevelScreen.js
const { level } = route.params; // ¿Qué pasa si params es undefined?
```

**Sugerencia:**
```javascript
const { level } = route.params || {};
if (!level) {
  return <ErrorScreen message="Nivel no encontrado" />;
}
```

---

### 12. Falta de Paginación en Listas

**Ubicación:** `GameHistoryScreen`, `WonPrizesScreen`, otras

**Problema:**
- Se cargan todos los datos de una vez
- Puede ser lento con muchos registros

**Sugerencia:**
- Implementar paginación o infinite scroll con React Query
```javascript
const { 
  data,
  fetchNextPage,
  hasNextPage,
} = useInfiniteQuery({
  queryKey: ['games'],
  queryFn: ({ pageParam = 0 }) => fetchGames(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

---

## ✅ Elementos que NO son Problemas

### 1. Uso de `any` o tipos dinámicos
- **No aplica:** El proyecto usa JavaScript, no TypeScript
- Si se migra a TypeScript en el futuro, se deberá tipar

### 2. Componentes grandes
- **Análisis:** Algunos componentes como `HomeScreen` son extensos pero bien organizados
- **Conclusión:** Es aceptable dado el contexto y funcionalidad

### 3. Uso de `useEffect` múltiples
- **Análisis:** Cada `useEffect` tiene una responsabilidad específica
- **Conclusión:** Uso correcto de hooks

---

## 📊 Priorización de Mejoras

### Alta Prioridad 🔴
1. Refresh token automático (seguridad)
2. Manejo de errores de red (UX)
3. Console.logs en producción (performance/seguridad)
4. Validación de parámetros de navegación (estabilidad)

### Media Prioridad 🟡
1. Estilos duplicados
2. Validaciones duplicadas
3. Estados de loading duplicados
4. Códigos de estado hardcodeados

### Baja Prioridad 🟢
1. Magic numbers en estilos
2. Paginación en listas
3. getImageUrl duplicada

---

## 🔄 Plan de Acción Sugerido

1. **Fase 1 - Estabilidad (Prioridad Alta)**
   - Implementar refresh token automático
   - Agregar manejo de errores de red
   - Crear wrapper para console.log
   - Validar parámetros en navegación

2. **Fase 2 - Refactorización (Prioridad Media)**
   - Crear commonStyles
   - Extraer validaciones a utilidades
   - Crear hook useRefreshableQuery
   - Centralizar constantes de estado

3. **Fase 3 - Optimización (Prioridad Baja)**
   - Definir spacing y borderRadius constants
   - Implementar paginación donde necesario
   - Limpiar re-exports innecesarios

---

## 📝 Notas Finales

- **Ninguno de estos elementos es crítico:** La aplicación funciona correctamente
- **Son oportunidades de mejora:** Para mejor mantenibilidad y escalabilidad
- **Priorizar según recursos:** No es necesario implementar todo de inmediato
- **Documentación actualizada:** Este documento debe actualizarse al implementar cambios

---

**Última actualización:** 2025-10-26
**Autor del análisis:** Documentación automática del sistema