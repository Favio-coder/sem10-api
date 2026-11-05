const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');

const app = require('../src/app');
const pool = require('../src/config/db');

test('CRUD, validaciones, errores JSON y cambios reales en MySQL', async () => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  let id;

  async function request(method, path, esperado, body) {
    const respuesta = await fetch(base + path, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    assert.equal(respuesta.status, esperado, `${method} ${path}`);
    assert.match(respuesta.headers.get('content-type'), /^application\/json/i);
    const json = await respuesta.json();
    if (esperado >= 400) assert.equal(typeof json.error, 'string');
    return json;
  }

  try {
    assert.ok(Array.isArray(await request('GET', '/api/productos', 200)));
    const creado = await request('POST', '/api/productos', 201, {
      nombre: ' Cuaderno prueba ', precio: 12.5, stock: 8,
    });
    id = creado.id;
    assert.ok(Number.isSafeInteger(id));
    assert.equal(creado.nombre, 'Cuaderno prueba');
    let [filas] = await pool.execute('SELECT nombre, precio, stock FROM productos WHERE id = ?', [id]);
    assert.deepEqual({ ...filas[0] }, { nombre: 'Cuaderno prueba', precio: 12.5, stock: 8 });

    const datos = { nombre: 'Cuaderno actualizado', precio: 13.75, stock: 6 };
    assert.equal((await request('PUT', `/api/productos/${id}`, 200, datos)).precio, 13.75);
    assert.equal((await request('PUT', `/api/productos/${id}`, 200, datos)).id, id);
    [filas] = await pool.execute('SELECT nombre, precio, stock FROM productos WHERE id = ?', [id]);
    assert.deepEqual({ ...filas[0] }, datos);

    await request('POST', '/api/productos', 400, { nombre: ' ', precio: -1, stock: -1 });
    await request('POST', '/api/productos', 400, { nombre: 'A', precio: 1.001, stock: 0 });
    await request('PUT', `/api/productos/${id}`, 400, { nombre: 'A', precio: 2, stock: 0.5 });
    await request('DELETE', '/api/productos/no-es-id', 400);
    await request('GET', '/ruta-inexistente', 404);

    assert.equal(typeof (await request('DELETE', `/api/productos/${id}`, 200)).mensaje, 'string');
    [filas] = await pool.execute('SELECT COUNT(*) AS total FROM productos WHERE id = ?', [id]);
    assert.equal(filas[0].total, 0);
    await request('DELETE', `/api/productos/${id}`, 404);
    await request('PUT', `/api/productos/${id}`, 404, datos);

    const invalido = await fetch(base + '/api/productos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{',
    });
    assert.equal(invalido.status, 400);
    assert.match(invalido.headers.get('content-type'), /^application\/json/i);
    assert.equal(typeof (await invalido.json()).error, 'string');
  } finally {
    if (id) await pool.execute('DELETE FROM productos WHERE id = ?', [id]);
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  }
});
