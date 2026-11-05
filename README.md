# Semana 10 — API REST de productos

**Estudiante:** Richard Favio Asturimac Medina  
**Asignatura:** Desarrollo de Aplicaciones Web (IS093A), UNCP  
**Guía:** `~/Descargas/Guia_Practica_Semana_10.pdf` (práctica individual). Aunque el encabezado diga Python, las actividades son Node.js/Express/MySQL.

## Objetivo y estado

Preparar una base MySQL persistente en Docker y desarrollar una API REST de productos con Node.js LTS (aquí v24.12.0), Express, mysql2/promise, cors y dotenv. **El CRUD ya funciona** y fue probado con Postman, pruebas automatizadas y comprobaciones directas de MySQL. Por solicitud posterior del estudiante, **el asistente implementó íntegramente los controladores y rutas**. Esta entrega **no cumple** la regla de la guía que exige que el estudiante escriba manualmente al menos el 70 % de esa lógica; si se evalúa esa condición, Richard deberá rehacerla personalmente.

## Credenciales locales

El archivo `.env` fue generado localmente con claves aleatorias y permisos `600`; **nunca se debe compartir ni publicar**. Si se instala en otro equipo, copiar `.env.example` a `.env`, generar dos claves distintas para `MYSQL_ROOT_PASSWORD` y `DB_PASSWORD`, y ajustar `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_NAME` y `PORT` si cambian. No reutilizar las cadenas de ejemplo. El servicio MySQL crea `db_lab10` y al usuario `lab10_app` con permisos sobre esa base. La API se conecta **como `lab10_app`, no como root**. Cambiar las variables de inicialización de Compose después de crear el volumen **no rota** las claves ya existentes: para rotarlas hay que usar SQL `ALTER USER`, conservando los datos.

## MySQL y tabla

Ejecutar desde este directorio:

```bash
docker compose pull mysql
docker compose up -d --wait mysql
docker compose ps
```

Compose usa el proyecto `sem10`, la imagen **mysql:8.4**, el volumen nombrado `sem10_mysql_data`, un healthcheck y publica **solo `127.0.0.1:3307`** → contenedor `3306`. No usar `down -v` ni eliminar volúmenes. Si se ocupa 3307 en el futuro, actualizar ambos `compose.yaml` y `DB_PORT` en `.env` (y el ejemplo/documentación) antes de iniciar.

La tabla se crea con SQL reproducible, sin necesidad de root:

```bash
docker compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysql -u "$MYSQL_USER" "$MYSQL_DATABASE"' < sql/01_productos.sql
docker compose exec -T mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysql -u "$MYSQL_USER" "$MYSQL_DATABASE" -e "SELECT VERSION(), DATABASE(); SHOW TABLES; SELECT * FROM productos;"'
```

La clave se lee dentro del contenedor y no aparece como argumento literal en el historial ni en la captura. No activar `set -x` ni imprimir variables de entorno. Para detener y reanudar **conservando los datos**:

```bash
docker compose stop mysql
docker compose up -d --wait mysql
```

`productos`: `id` autoincremental, `nombre` obligatorio y no blanco, `precio DECIMAL(10,2)` no negativo, `stock` entero no negativo, `created_at` automático. Hay restricciones SQL, pero la API también debe validar entradas antes de ejecutar consultas.

## API: instalación y ejecución

```bash
npm ci
npm start
# o npm run dev para reinicio automático
npm test # necesita MySQL saludable; inserta y elimina su propio producto de prueba
```

Servidor local en `http://127.0.0.1:3000`; necesita MySQL listo para las consultas, pero permanece encendido si MySQL se detiene y debe responder con 500 a errores de DB. `src/config/db.js` carga `.env` y crea un pool con `mysql2/promise`. `src/app.js` activa JSON, CORS, ruta base `/api/productos`, y errores globales 400/404/500 sin credenciales ni stack traces.

### Contrato REST implementado

| Método | Ruta | Éxito esperado | Errores esperados |
| --- | --- | --- | --- |
| GET | `/api/productos` | 200, array JSON (también `[]`) | 500 |
| POST | `/api/productos` | 201, producto creado en JSON con `id` | 400, 500 |
| PUT | `/api/productos/:id` | 200, producto actualizado en JSON | 400, 404, 500 |
| DELETE | `/api/productos/:id` | 200, JSON de confirmación | 400, 404, 500 |

Body de POST/PUT: `{"nombre":"Cuaderno","precio":12.50,"stock":8}`. Aceptar únicamente un nombre no vacío de hasta 150 caracteres, precio numérico finito ≥0 con máximo dos decimales y dentro del rango `DECIMAL(10,2)`, stock entero ≥0 dentro del rango de `INT UNSIGNED`; `id` entero positivo y seguro. Los errores deben ser JSON como `{"error":"Producto no encontrado"}`. Una ruta desconocida devuelve 404. JSON sintácticamente inválido devuelve 400. No incluir datos sensibles en errores ni logs.

### Implementación y validación

`src/routes/productosRoutes.js` registra los cuatro verbos. `src/controllers/productosController.js` valida identificadores, nombre, precio y stock; utiliza `async/await`, `try/catch` y `pool.execute(sql, valores)` con parámetros `?`, sin concatenar valores de usuario en SQL. POST devuelve la fila creada; PUT consulta el registro tras actualizarlo para devolver 200 aunque los valores nuevos sean idénticos; DELETE confirma con JSON. Los errores 500 no revelan detalles de conexión, credenciales ni stack traces. No hubo un incidente de conexión o consulta compleja depurado con IA que requiera inventar el comentario `// IA: [problema] → Solución manual: [explicación]`.

## Colección Postman y verificación

Importar `postman/productos.postman_collection.json` en Postman; `baseUrl` viene configurada como `http://127.0.0.1:3000`. Ejecutar **peticiones 01 a 10** en orden: listado, creación (guarda `productoId`), actualización, actualización idéntica, eliminación, id inexistente, datos inválidos y ruta inexistente. Las pruebas de la colección comprueban código, `Content-Type: application/json`, cuerpo JSON y formato de error. Comprobar también en MySQL con el comando `SELECT * FROM productos;` de arriba, antes/después de cada modificación. Las peticiones 01–06 y 08, además de 11, se comprobaron en la interfaz de Postman con pruebas aprobadas. Los casos restantes y el ciclo completo también fueron verificados por HTTP y `npm test`; no se afirma que se haya ejecutado el *Collection Runner* completo.

**Petición 11 (500): ejecutarla solo por separado** tras `docker compose stop mysql`, usando el GET del listado como fallo controlado. Restaurar **inmediatamente** con `docker compose up -d --wait mysql` y volver a comprobar GET 200 y la consulta MySQL. No ejecutar toda la colección sin excluir la petición 11. Esta prueba se realizó: Postman devolvió 500 con `{ "error": "Error interno del servidor" }` y, tras restaurar MySQL, volvió a devolver 200. Todas las capturas son pantallas reales de Postman o la terminal; no se fabricaron respuestas.

## Evidencias y autoría

Índice y estado: [`capturas/README.md`](capturas/README.md). El asistente preparó Docker, SQL, dependencias, pool, CRUD completo, colección, pruebas y documentación por petición expresa de Richard Favio Asturimac Medina. **No atribuir al estudiante el 70 % de lógica manual requerido por la guía:** ese criterio queda incumplido y requiere trabajo propio para satisfacerlo. Hay un remoto `origin` configurado localmente (`https://github.com/Favio-coder/sem10-api.git`), pero **no se ha publicado ni verificado su contenido remoto**; no se hizo `git push`. `.env`, `node_modules/` y claves están excluidos de Git.
