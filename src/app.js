const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productosRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/productos', productosRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta inexistente' }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON inválido' });
  }
  console.error('Error interno en la API');
  return res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
