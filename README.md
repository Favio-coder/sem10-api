# Semana 10 — API REST de productos

**Estudiante:** Richard Favio Asturimac Medina  
**Asignatura:** Desarrollo de Aplicaciones Web (IS093A), UNCP  
**Guía:** `~/Descargas/Guia_Practica_Semana_10.pdf` (práctica individual). Aunque el encabezado diga Python, las actividades son Node.js/Express/MySQL.

## Objetivo y estado

Preparar una base MySQL persistente en Docker y desarrollar una API REST de productos con Node.js LTS (aquí v24.12.0), Express, mysql2/promise, cors y dotenv. **MySQL, la tabla, el pool y el esqueleto de la API están listos; el CRUD NO está implementado.** La guía exige que el estudiante escriba manualmente al menos el 70 % de la lógica de controladores y rutas: `src/controllers/productosController.js` contiene firmas y respuestas temporales `501`, y `src/routes/productosRoutes.js` todavía no registra endpoints. Las pruebas de CRUD y sus capturas siguen pendientes.

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
```

Servidor local en `http://127.0.0.1:3000`; necesita MySQL listo para las consultas, pero permanece encendido si MySQL se detiene y debe responder con 500 a errores de DB. `src/config/db.js` carga `.env` y crea un pool con `mysql2/promise`. `src/app.js` activa JSON, CORS, ruta base `/api/productos`, y errores globales 400/404/500 sin credenciales ni stack traces.

### Contrato REST **a implementar manualmente**

| Método | Ruta | Éxito esperado | Errores esperados |
| --- | --- | --- | --- |
| GET | `/api/productos` | 200, array JSON (también `[]`) | 500 |
| POST | `/api/productos` | 201, producto creado en JSON con `id` | 400, 500 |
| PUT | `/api/productos/:id` | 200, producto actualizado en JSON | 400, 404, 500 |
| DELETE | `/api/productos/:id` | 200, JSON de confirmación | 400, 404, 500 |

Body de POST/PUT: `{"nombre":"Cuaderno","precio":12.50,"stock":8}`. Aceptar únicamente un nombre no vacío de hasta 150 caracteres, precio numérico finito ≥0 con máximo dos decimales y dentro del rango `DECIMAL(10,2)`, stock entero ≥0 dentro del rango de `INT UNSIGNED`; `id` entero positivo y seguro. Los errores deben ser JSON como `{"error":"Producto no encontrado"}`. Una ruta desconocida devuelve 404. JSON sintácticamente inválido devuelve 400. No incluir datos sensibles en errores ni logs.

### Tu parte manual: firmas y pseudocódigo

En `src/routes/productosRoutes.js`, importa las cuatro funciones y **escribe tú** las cuatro asociaciones entre verbos, rutas relativas (`/` o `/:id`) y controladores; `src/app.js` ya añade `/api/productos`. En `src/controllers/productosController.js`, reemplaza las respuestas provisionales de estas firmas:

- `async function listarProductos(req, res)`: `try → await pool.execute('SELECT ... FROM productos ORDER BY id') → status(200).json(filas); catch → status(500).json({ error: ... })`.
- `async function crearProducto(req, res)`: validar body → 400 si falla → `execute('INSERT ... VALUES (?, ?, ?)', [nombre, precio, stock])` → obtener `insertId` y, si deseas devolver toda la fila, `execute('SELECT ... WHERE id = ?', [insertId])` → 201; errores DB → 500.
- `async function actualizarProducto(req, res)`: validar `id` y body → 400; `SELECT ... WHERE id = ?` para comprobar existencia → 404 si no existe; `UPDATE ... SET nombre = ?, precio = ?, stock = ? WHERE id = ?` → 200 con JSON. **Si los valores son idénticos, sigue siendo 200**: no uses `changedRows === 0` como prueba de inexistencia. Capturar DB → 500.
- `async function eliminarProducto(req, res)`: validar `id` → 400; `DELETE ... WHERE id = ?` → `affectedRows === 0` da 404, si no 200 con JSON (por ejemplo `{ "mensaje": "Producto eliminado" }`); errores DB → 500.

Usa `const pool = require('../config/db')`, `async/await`, `try/catch` y **`pool.execute(sql, valores)` con marcadores `?`**; nunca concatenes datos del usuario en SQL. No hay obligación de copiar el pseudocódigo como código. Cuando realmente se resuelva con IA un error de conexión o una consulta compleja, agrega un comentario veraz con el formato `// IA: [problema] → Solución manual: [explicación]`; no inventes incidentes.

## Colección Postman y verificación pendiente

Importar `postman/productos.postman_collection.json` en Postman; `baseUrl` viene configurada como `http://127.0.0.1:3000`. Una vez implementado el CRUD, ejecutar **peticiones 01 a 10** en orden: listado, creación (guarda `productoId`), actualización, actualización idéntica, eliminación, id inexistente, datos inválidos y ruta inexistente. Las pruebas de la colección comprueban código, `Content-Type: application/json`, cuerpo JSON y formato de error. Comprobar también en MySQL con el comando `SELECT * FROM productos;` de arriba, antes/después de cada modificación.

**Petición 11 (500): ejecutarla solo por separado** tras `docker compose stop mysql`, usando el GET del listado como fallo controlado. Restaurar **inmediatamente** con `docker compose up -d --wait mysql` y volver a comprobar GET 200 y la consulta MySQL. No ejecutar toda la colección sin excluir la petición 11. Para evidencias de la guía: tomar capturas reales en Postman/Insomnia/Thunder Client mostrando status y body; curl puede servir de apoyo. **No se han ejecutado las pruebas del CRUD ni provocado el fallo 500, porque aún no hay lógica manual.**

## Evidencias y autoría

Índice y estado: [`capturas/README.md`](capturas/README.md). Capturas reales del entorno, imagen, contenedor y consulta ya obtenidas; capturas de endpoints pendientes. El asistente preparó Compose, SQL, dependencias, pool, esqueleto, colección y documentación; Richard Favio Asturimac Medina implementará manualmente rutas y controladores (≥70 % de su lógica) y comprobará los endpoints con Postman. No hubo incidentes de conexión ni consultas complejas resueltos por IA que requieran comentario de incidencia. Sin repositorio remoto ni URL de GitHub: publicación **pendiente de autorización explícita**. `.env`, `node_modules/` y claves están excluidos de Git.
