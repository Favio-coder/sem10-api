require('dotenv').config({ quiet: true });

const app = require('./app');

const port = Number(process.env.PORT || 3000);
app.listen(port, '127.0.0.1', () => {
  console.log(`API disponible en http://127.0.0.1:${port}`);
});
