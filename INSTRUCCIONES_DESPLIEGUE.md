# 🚀 Instrucciones de Despliegue - Estandarización de Tipos de Retos

## ⚠️ IMPORTANTE: Leer antes de desplegar

Esta actualización incluye cambios en el modelo de datos que requieren migración de la base de datos.

## 📋 Checklist Pre-Despliegue

- [ ] Backup de la base de datos
- [ ] Revisión de cambios en modelos
- [ ] Prueba del script de migración en ambiente de desarrollo
- [ ] Verificación de que no hay retos activos críticos

## 🔄 Pasos de Despliegue

### 1. Backup (CRÍTICO)

```bash
# MongoDB backup
mongodump --uri="tu-mongodb-uri" --out=/backup/pre-migration-$(date +%Y%m%d)
```

### 2. Actualizar Código

```bash
# En tu entorno de producción
git pull origin cursor/standardize-text-challenge-type-logic-5aa7

# Backend
cd backend
npm install  # Por si acaso hay nuevas dependencias

# Mobile
cd ../mobile
npm install

# Backoffice
cd ../backoffice
npm install
```

### 3. Migrar Base de Datos

**⚠️ PASO CRÍTICO - Ejecutar en este orden:**

```bash
cd backend

# Verificar conexión a MongoDB
node -e "require('dotenv').config(); console.log('MongoDB URI:', process.env.MONGO_URI)"

# Ejecutar migración
node src/seeds/migrateChallengeTypes.js
```

**Salida esperada:**
```
✅ Conectado a MongoDB
🔄 Iniciando migración de tipos de retos...

📋 Migrando plantillas de retos (ChallengeTemplate)...
   ✓ date_guess → date: X plantilla(s) actualizada(s)
   ✓ riddle → text: X plantilla(s) actualizada(s)
   ... etc ...

🎯 Migrando retos generados (Challenge)...
   ✓ date_guess → date: X reto(s) actualizado(s)
   ... etc ...

============================================
✨ Migración completada exitosamente
============================================
```

### 4. Verificar Migración

```bash
# Conectar a MongoDB y verificar
mongo tu-mongodb-uri

# En mongo shell:
use duochallenge

# Verificar que no hay tipos antiguos
db.challengetemplates.distinct("type")
# Debe retornar: ["text", "date", "photo"]

db.challenges.distinct("type")
# Debe retornar: ["text", "date", "photo"]

# Si hay tipos antiguos, la migración no funcionó
```

### 5. Reiniciar Servicios

```bash
# Backend
pm2 restart duochallenge-api
# o
systemctl restart duochallenge-backend

# Mobile - rebuild app
cd mobile
npm run build  # o el comando que uses

# Backoffice - rebuild
cd backoffice
npm run build
```

### 6. Smoke Tests

**Backend:**
```bash
# Probar endpoint de verificación
curl -X POST http://tu-api/api/game/verify/CHALLENGE_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answer": "test"}'
```

**Backoffice:**
1. Login
2. Ir a "Plantillas de Retos"
3. Crear nueva plantilla con tipo "text"
4. Verificar que se guarda correctamente

**Mobile App:**
1. Abrir un nivel
2. Abrir un reto
3. Ingresar respuesta
4. Verificar que se valida correctamente

## 🔍 Troubleshooting

### Problema: La migración no actualiza nada

**Causa probable:** No hay datos con tipos antiguos

**Solución:** Verificar si ya se ejecutó la migración antes
```bash
db.challenges.find({type: {$in: ["date_guess", "riddle", "photo_puzzle", "location", "question"]}}).count()
```

### Problema: Error "Cannot read property 'type' of null"

**Causa probable:** Variables no encontradas en UserData

**Solución:** Verificar que las variables existan:
```bash
db.variables.find({}).pretty()
```

### Problema: App móvil muestra etiquetas incorrectas

**Causa probable:** Cache o versión antigua

**Solución:**
- Limpiar cache de la app
- Reinstalar app
- Verificar que se desplegó la versión correcta

### Problema: Error al crear plantilla en backoffice

**Causa probable:** Enum no actualizado en modelo

**Solución:**
- Verificar que el backend se reinició después del despliegue
- Verificar logs del backend
- Revisar que los modelos se actualizaron correctamente

## 📊 Monitoreo Post-Despliegue

### Métricas a vigilar

1. **Tasa de error en verificación de retos**
   - Debe mantenerse igual o menor que antes
   
2. **Tiempo de respuesta de endpoints**
   - No debe aumentar significativamente

3. **Logs de errores**
   - Buscar errores relacionados con "type" o "challenge"

### Queries útiles

```javascript
// MongoDB - Ver distribución de tipos después de migración
db.challenges.aggregate([
  { $group: { _id: "$type", count: { $sum: 1 } } }
])

// Ver retos creados después de la migración
db.challenges.find({
  createdAt: { $gte: ISODate("2025-10-11T00:00:00Z") }
}).pretty()
```

## 🔙 Rollback (En caso de emergencia)

Si algo sale mal y necesitas hacer rollback:

### 1. Restaurar código anterior
```bash
git checkout [commit-anterior]
pm2 restart duochallenge-api
```

### 2. Restaurar base de datos
```bash
mongorestore --uri="tu-mongodb-uri" /backup/pre-migration-YYYYMMDD
```

### 3. Verificar funcionamiento
- Probar endpoints críticos
- Verificar que los retos funcionan

## ✅ Validación Final

Después del despliegue, validar:

- [ ] Backend responde correctamente
- [ ] Backoffice puede crear/editar plantillas
- [ ] Mobile app muestra retos correctamente
- [ ] Verificación de respuestas funciona
- [ ] No hay errores en logs
- [ ] Métricas normales

## 📞 Contacto

Si encuentras problemas durante el despliegue:
1. Revisar logs detalladamente
2. Consultar CHALLENGE_TYPE_MIGRATION.md
3. Verificar que todos los pasos se ejecutaron
4. Considerar rollback si es crítico

## 📝 Notas

- **Tiempo estimado de despliegue:** 15-30 minutos
- **Downtime esperado:** 2-5 minutos (solo durante reinicio de servicios)
- **Compatibilidad:** Los retos existentes siguen funcionando después de la migración
- **Rollback:** Posible en cualquier momento con backup de BD

---

**Última actualización:** 2025-10-11
**Versión de branch:** `cursor/standardize-text-challenge-type-logic-5aa7`
