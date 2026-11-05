# Evidencias de Semana 10 — Richard Favio Asturimac Medina

Las imágenes presentes son capturas reales de pantalla, obtenidas al comprobar cada avance. No hay capturas simuladas. No aparecen contraseñas. Las capturas de código provisional **no demuestran que el CRUD funcione**.

| Archivo | Qué demuestra | Estado |
| --- | --- | --- |
| `01_estado_inicial.png` | Docker, Compose, Node, contenedores anteriores y puerto 3307 libre | Obtenida |
| `02_mysql_descargado.png` | Imagen `mysql:8.4` presente | Obtenida |
| `03_mysql_saludable.png` | Servicio MySQL saludable, volumen y publicación local | Obtenida |
| `04_conexion_mysql.png` | Consulta real `SELECT VERSION(), DATABASE()` con usuario de aplicación y grants | Obtenida |
| `05_estructura_proyecto.png` | Archivos de proyecto sin mostrar `.env` | Obtenida |
| `06_tabla_productos.png` | Tabla creada, columnas y conteo de registros | Obtenida |
| `07_configuracion_pool.png` | Código de pool sin credenciales | Obtenida |
| `08_controlador.png` | Esqueleto provisional; reemplazar con captura final tras implementación manual | Pendiente |
| `09_rutas.png` | Esqueleto provisional; reemplazar con captura final tras implementación manual | Pendiente |
| `10_get_200.png` | GET 200 en Postman/Insomnia/Thunder Client | Pendiente |
| `11_post_201.png` | POST 201 y JSON | Pendiente |
| `12_put_200.png` | PUT 200 y JSON | Pendiente |
| `13_delete_200.png` | DELETE 200 y JSON | Pendiente |
| `14_error_400.png` | Datos inválidos: 400 y `{error}` | Pendiente |
| `15_error_404.png` | Producto inexistente: 404 y `{error}` | Pendiente |
| `16_error_500.png` | MySQL detenido: 500 sin datos sensibles; restaurarlo enseguida | Pendiente |
| `17_verificacion_final.png` | MySQL recuperado, GET 200, datos comprobados | Pendiente |

Para completar las pendientes: implementa manualmente controladores y rutas, ejecuta la colección de Postman (peticiones 01 a 10), captura cada resultado **en el momento en que ocurra** con código y body legibles, prueba por separado la 500 y restaura MySQL antes de la verificación final. No reutilizar ni crear imágenes artificiales de resultados.
