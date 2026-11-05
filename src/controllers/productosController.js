const pool = require('../config/db');

const columnas = 'id, nombre, precio, stock, created_at';

function idValido(id) {
  const numero = Number(id);
  return /^[1-9]\d*$/.test(id) && Number.isSafeInteger(numero) && numero <= 4294967295;
}

function validarProducto(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some((campo) => !['nombre', 'precio', 'stock'].includes(campo))) {
    return null;
  }

  const { nombre, precio, stock } = body;
  if (typeof nombre !== 'string') return null;

  const nombreLimpio = nombre.trim();
  if (!nombreLimpio || [...nombreLimpio].length > 150 ||
      typeof precio !== 'number' || !Number.isFinite(precio) ||
      precio < 0 || precio > 99999999.99 || Number(precio.toFixed(2)) !== precio ||
      !Number.isInteger(stock) || stock < 0 || stock > 4294967295) {
    return null;
  }

  return { nombre: nombreLimpio, precio, stock };
}

function errorInterno(res) {
  console.error('Error interno al consultar productos');
  return res.status(500).json({ error: 'Error interno del servidor' });
}

async function listarProductos(req, res) {
  try {
    const [productos] = await pool.execute(`SELECT ${columnas} FROM productos ORDER BY id`);
    return res.status(200).json(productos);
  } catch {
    return errorInterno(res);
  }
}

async function crearProducto(req, res) {
  const producto = validarProducto(req.body);
  if (!producto) return res.status(400).json({ error: 'Datos del producto inválidos' });

  try {
    const [resultado] = await pool.execute(
      'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
      [producto.nombre, producto.precio, producto.stock],
    );
    const [filas] = await pool.execute(
      `SELECT ${columnas} FROM productos WHERE id = ?`, [resultado.insertId],
    );
    return res.status(201).json(filas[0]);
  } catch {
    return errorInterno(res);
  }
}

async function actualizarProducto(req, res) {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ error: 'Identificador inválido' });
  }
  const producto = validarProducto(req.body);
  if (!producto) return res.status(400).json({ error: 'Datos del producto inválidos' });

  try {
    await pool.execute(
      'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
      [producto.nombre, producto.precio, producto.stock, Number(req.params.id)],
    );
    // Consultar la existencia: una actualización con valores idénticos también es válida.
    const [filas] = await pool.execute(
      `SELECT ${columnas} FROM productos WHERE id = ?`, [Number(req.params.id)],
    );
    if (!filas.length) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.status(200).json(filas[0]);
  } catch {
    return errorInterno(res);
  }
}

async function eliminarProducto(req, res) {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ error: 'Identificador inválido' });
  }

  try {
    const [resultado] = await pool.execute(
      'DELETE FROM productos WHERE id = ?', [Number(req.params.id)],
    );
    if (!resultado.affectedRows) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    return res.status(200).json({ mensaje: 'Producto eliminado' });
  } catch {
    return errorInterno(res);
  }
}

module.exports = { listarProductos, crearProducto, actualizarProducto, eliminarProducto };
