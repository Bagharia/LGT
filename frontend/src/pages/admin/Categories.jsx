import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../../services/api';
import Header from '../../components/Header';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    hasTwoSides: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAllAdmin();
      setCategories(data.categories || []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const slugify = (str) =>
    str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const handleNameChange = (name) => {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : slugify(name)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, formData);
      } else {
        await categoriesAPI.create(formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '', hasTwoSides: true });
      loadCategories();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      hasTwoSides: category.hasTwoSides
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    try {
      await categoriesAPI.delete(id);
      loadCategories();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const moveCategory = async (index, direction) => {
    const newCategories = [...categories];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newCategories.length) return;

    [newCategories[index], newCategories[swapIndex]] = [newCategories[swapIndex], newCategories[index]];

    const items = newCategories.map((cat, i) => ({ id: cat.id, displayOrder: i }));
    setCategories(newCategories);

    try {
      await categoriesAPI.reorder(items);
    } catch (error) {
      console.error('Erreur:', error);
      loadCategories();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mx-auto"></div>
          <p className="mt-4 text-text-muted">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      <div className="px-8 md:px-16 py-12 pt-24">
        {/* Page Title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Link to="/admin" className="text-accent hover:text-white transition-colors text-sm mb-4 inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour au Dashboard
            </Link>
            <h1 className="font-space-grotesk text-4xl md:text-5xl font-bold text-white mb-4">
              Gestion des <span className="accent">Catégories</span>
            </h1>
            <p className="text-text-muted text-lg">
              {categories.length} catégorie(s)
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', slug: '', hasTwoSides: true });
              setShowModal(true);
            }}
            className="btn-primary self-start md:self-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une catégorie
          </button>
        </div>

        {/* Categories List */}
        {categories.length === 0 ? (
          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="font-space-grotesk text-2xl font-bold text-white mb-3">Aucune catégorie</h3>
            <p className="text-text-muted mb-6">Ajoutez votre première catégorie pour organiser vos produits.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="bg-[#0D2137] rounded-2xl border border-white/10 p-6 flex items-center gap-6 hover:border-accent/30 transition-colors"
              >
                {/* Order Arrows */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveCategory(index, -1)}
                    disabled={index === 0}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveCategory(index, 1)}
                    disabled={index === categories.length - 1}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Category Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-space-grotesk text-xl font-semibold text-white">
                      {category.name}
                    </h3>
                    <span className="text-xs bg-white/10 text-text-muted px-2 py-1 rounded">
                      /{category.slug}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      category.isActive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      {category._count?.products || 0} produit(s)
                    </span>
                    <span className={`flex items-center gap-1 ${category.hasTwoSides ? 'text-accent' : 'text-purple-400'}`}>
                      {category.hasTwoSides ? 'Recto/Verso' : 'Recto seul'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="px-4 py-2.5 bg-accent text-primary rounded-xl font-medium text-sm hover:bg-accent/90 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={category._count?.products > 0}
                    className="px-4 py-2.5 bg-white/5 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={category._count?.products > 0 ? 'Impossible de supprimer une catégorie avec des produits' : ''}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#0D2137] border border-white/10 rounded-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="font-space-grotesk text-2xl font-bold text-white">
                {editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Nom <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                  placeholder="Ex: T-Shirts, Posters, Cadres..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                  placeholder="Auto-généré depuis le nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-3">
                  Type d'éditeur
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasTwoSides: true })}
                    className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                      formData.hasTwoSides
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold mb-1">Recto / Verso</div>
                    <div className="text-xs opacity-70">T-shirts, textiles...</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, hasTwoSides: false })}
                    className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                      !formData.hasTwoSides
                        ? 'border-purple-400 bg-purple-500/10 text-purple-400'
                        : 'border-white/10 bg-white/5 text-text-muted hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold mb-1">Recto seul</div>
                    <div className="text-xs opacity-70">Posters, cadres...</div>
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-white/5 text-white border border-white/10 rounded-xl hover:bg-white/10 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary justify-center"
                >
                  {editingCategory ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 md:px-16 py-8 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="font-space-grotesk text-xl font-bold text-white">
            LGT<span className="text-accent">.</span>
          </Link>
          <p className="text-text-muted text-sm">
            &copy; 2026 LGT. Panel Administrateur.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminCategories;
