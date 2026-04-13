import { useEffect, useState } from 'react';
import './styles.css';

const emptyForm = {
  name: '',
  description: '',
  price: '',
};

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'La requete a echoue.');
  }

  return payload;
}

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadProducts() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api');
      const payload = await readJson(response);
      setProducts(payload.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(editingId ? `/api/${editingId}` : '/api', {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
        }),
      });

      const payload = await readJson(response);
      setMessage(payload.message || 'Operation realisee avec succes.');
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
    });
    setMessage('');
    setError('');
  }

  async function handleDelete(productId) {
    const shouldDelete = window.confirm('Voulez-vous vraiment supprimer ce produit ?');

    if (!shouldDelete) {
      return;
    }

    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/${productId}`, {
        method: 'DELETE',
      });

      const payload = await readJson(response);
      setMessage(payload.message || 'Produit supprime.');

      if (editingId === productId) {
        resetForm();
      }

      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">TP Docker Compose</p>
          <h1>Gestion de produits</h1>
          <p className="hero-text">
            test
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={loadProducts}>
          Actualiser
        </button>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Formulaire CRUD</p>
              <h2>{editingId ? 'Modifier un produit' : 'Ajouter un produit'}</h2>
            </div>
          </div>

          <form className="product-form" onSubmit={handleSubmit}>
            <label>
              Nom
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex : Casque audio"
                required
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Courte description du produit"
                rows="4"
              />
            </label>

            <label>
              Prix
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="99.99"
                required
              />
            </label>

            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={submitting}>
                {submitting
                  ? 'Enregistrement...'
                  : editingId
                    ? 'Mettre a jour'
                    : 'Ajouter'}
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={resetForm}
                disabled={submitting}
              >
                Reinitialiser
              </button>
            </div>
          </form>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Liste MySQL</p>
              <h2>Produits disponibles</h2>
            </div>
            <span className="pill">{products.length} produit(s)</span>
          </div>

          {message ? <div className="banner success">{message}</div> : null}
          {error ? <div className="banner error">{error}</div> : null}

          {loading ? (
            <div className="state-box">Chargement des donnees...</div>
          ) : products.length === 0 ? (
            <div className="state-box">Aucun produit enregistre pour le moment.</div>
          ) : (
            <div className="product-list">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-card__header">
                    <div>
                      <h3>{product.name}</h3>
                      <p className="product-id">ID #{product.id}</p>
                    </div>
                    <strong>{Number(product.price).toFixed(2)} EUR</strong>
                  </div>
                  <p className="product-description">
                    {product.description || 'Aucune description fournie.'}
                  </p>
                  <div className="card-actions">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => handleEdit(product)}
                    >
                      Modifier
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => handleDelete(product.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default App;

