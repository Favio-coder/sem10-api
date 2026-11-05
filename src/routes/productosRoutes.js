const { Router } = require('express');
const {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require('../controllers/productosController');

const router = Router();

router.get('/', listarProductos);
router.post('/', crearProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;
