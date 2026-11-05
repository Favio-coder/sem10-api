# Evidencias de Semana 10 — Richard Favio Asturimac Medina

Las imágenes presentes son capturas reales de pantalla, obtenidas al comprobar cada avance. No hay capturas simuladas ni contraseñas visibles. El asistente implementó el CRUD por solicitud posterior del estudiante; por tanto, estas capturas **no acreditan el 70 % de trabajo manual exigido por la guía**.

| Archivo | Qué demuestra | Estado |
| --- | --- | --- |
| `01_estado_inicial.png` | Docker, Compose, Node, contenedores anteriores y puerto 3307 libre | Obtenida |
| `02_mysql_descargado.png` | Imagen `mysql:8.4` presente | Obtenida |
| `03_mysql_saludable.png` | Servicio MySQL saludable, volumen y publicación local | Obtenida |
| `04_conexion_mysql.png` | Consulta real `SELECT VERSION(), DATABASE()` con usuario de aplicación y grants | Obtenida |
| `05_estructura_proyecto.png` | Archivos de proyecto sin mostrar `.env` | Obtenida |
| `06_tabla_productos.png` | Tabla creada, columnas y conteo de registros | Obtenida |
| `07_configuracion_pool.png` | Código de pool sin credenciales | Obtenida |
| `08_controlador.png` | Código real de POST/PUT y manejo de errores | Obtenida |
| `09_rutas.png` | Registro real de GET/POST/PUT/DELETE | Obtenida |
| `10_get_200.png` | GET 200 en Postman | Obtenida |
| `11_post_201.png` | POST 201 y JSON en Postman; id creado en MySQL | Obtenida |
| `12_put_200.png` | PUT 200 en Postman y valores actualizados en MySQL | Obtenida |
| `13_delete_200.png` | DELETE 200 en Postman, ausencia verificada en MySQL | Obtenida |
| `14_error_400.png` | Datos inválidos: 400 y `{error}` en Postman | Obtenida |
| `15_error_404.png` | Producto inexistente: 404 y `{error}` en Postman | Obtenida |
| `16_error_500.png` | MySQL detenido: 500 sin datos sensibles en Postman | Obtenida |
| `17_verificacion_final.png` | MySQL restaurado y saludable, GET 200 y tabla consultada | Obtenida |
| `18_get_recuperado_postman.png` | GET 200 en Postman después de restaurar MySQL | Obtenida |

El *Collection Runner* completo no fue ejecutado: las peticiones principales y el fallo 500 se probaron individualmente en Postman. La integración y otros casos se comprobaron con `npm test` y peticiones HTTP. Hay un remoto `origin` configurado localmente, pero no se ha publicado con `git push`; si la evaluación lo exige, habrá que rehacer la lógica manualmente para cumplir el criterio del 70 %.
