const express = require('express');
const cors = require('cors');
const { getPool, initDb } = require('./db');

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parseId(rawId) {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    throw createHttpError(400, 'Identifiant invalide.');
  }

  return id;
}

function normalizeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: Number(product.price),
  };
}

function validateProductPayload(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description =
    typeof body.description === 'string' ? body.description.trim() : '';
  const price = Number(body.price);

  if (!name) {
    throw createHttpError(400, 'Le champ "name" est obligatoire.');
  }

  if (name.length > 120) {
    throw createHttpError(400, 'Le champ "name" ne doit pas depasser 120 caracteres.');
  }

  if (description.length > 255) {
    throw createHttpError(400, 'Le champ "description" ne doit pas depasser 255 caracteres.');
  }

  if (!Number.isFinite(price) || price < 0) {
    throw createHttpError(400, 'Le champ "price" doit etre un nombre positif ou nul.');
  }

  return {
    name,
    description,
    price,
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get(
  '/api',
  asyncHandler(async (req, res) => {
    const [rows] = await getPool().execute(
      'SELECT id, name, description, price FROM products ORDER BY id ASC'
    );

    res.json({ data: rows.map(normalizeProduct) });
  })
);

app.get(
  '/api/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const [rows] = await getPool().execute(
      'SELECT id, name, description, price FROM products WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      throw createHttpError(404, 'Produit introuvable.');
    }

    res.json({ data: normalizeProduct(rows[0]) });
  })
);

app.post(
  '/api',
  asyncHandler(async (req, res) => {
    const product = validateProductPayload(req.body);
    const [result] = await getPool().execute(
      'INSERT INTO products (name, description, price) VALUES (?, ?, ?)',
      [product.name, product.description, product.price]
    );

    const [rows] = await getPool().execute(
      'SELECT id, name, description, price FROM products WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Produit ajoute avec succes.',
      data: normalizeProduct(rows[0]),
    });
  })
);

app.put(
  '/api/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const product = validateProductPayload(req.body);

    const [result] = await getPool().execute(
      'UPDATE products SET name = ?, description = ?, price = ? WHERE id = ?',
      [product.name, product.description, product.price, id]
    );

    if (result.affectedRows === 0) {
      throw createHttpError(404, 'Produit introuvable.');
    }

    const [rows] = await getPool().execute(
      'SELECT id, name, description, price FROM products WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Produit modifie avec succes.',
      data: normalizeProduct(rows[0]),
    });
  })
);

app.delete(
  '/api/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    const [result] = await getPool().execute('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw createHttpError(404, 'Produit introuvable.');
    }

    res.json({ message: 'Produit supprime avec succes.' });
  })
);

app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable.' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const status = error.status || 500;
  const message =
    status === 500 ? 'Une erreur interne est survenue.' : error.message;

  console.error(error);
  res.status(status).json({ message });
});

async function startServer() {
  await initDb();
  app.listen(port, () => {
    console.log(`Serveur backend demarre sur le port ${port}.`);
  });
}

startServer().catch((error) => {
  console.error('Impossible de lancer le backend :', error.message);
  process.exit(1);
});

