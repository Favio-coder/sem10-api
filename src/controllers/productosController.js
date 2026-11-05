// Ejercicio manual (>=70 %): sustituye cada respuesta provisional por tu lógica.
// Consulta el pseudocódigo de README.md; usa pool.execute(SQL, parametros).

async function listarProductos(req, res) {
  // TODO: SELECT; 200 con arreglo JSON; try/catch para 500 sin revelar detalles.
  return res.status(501).json({ error: 'Implementación manual pendiente' });
}

async function crearProducto(req, res) {
  // TODO: validar body; INSERT parametrizado; 201 con JSON; 400/500.
  return res.status(501).json({ error: 'Implementación manual pendiente' });
}

async function actualizarProducto(req, res) {
  // TODO: validar id/body; comprobar existencia, no solo changedRows; UPDATE; 200/400/404/500.
  return res.status(501).json({ error: 'Implementación manual pendiente' });
}

async function eliminarProducto(req, res) {
  // TODO: validar id; DELETE parametrizado; 200 JSON o 404; 400/500.
  return res.status(501).json({ error: 'Implementación manual pendiente' });
}

module.exports = { listarProductos, crearProducto, actualizarProducto, eliminarProducto };
