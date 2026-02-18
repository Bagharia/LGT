import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../../services/api';
import { useToast } from '../../components/Toast';
import Header from '../../components/Header';
import ImageUpload from '../../components/ImageUpload';

const AdminProducts = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    mockupFrontUrl: '',
    mockupBackUrl: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsAPI.getAllAdmin(),
        categoriesAPI.getAllAdmin()
      ]);
      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData);
      } else {
        await productsAPI.create(productData);
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      categoryId: '',
      mockupFrontUrl: '',
      mockupBackUrl: ''
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      basePrice: product.basePrice.toString(),
      categoryId: product.categoryId?.toString() || '',
      mockupFrontUrl: product.mockupFrontUrl || '',
      mockupBackUrl: product.mockupBackUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver ce produit ?')) return;
    try {
      await productsAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const moveProduct = async (index, direction) => {
    const filtered = filteredProducts;
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= filtered.length) return;

    const newProducts = [...products];
    const productA = filtered[index];
    const productB = filtered[swapIndex];

    // Swap displayOrder values
    const idxA = newProducts.findIndex(p => p.id === productA.id);
    const idxB = newProducts.findIndex(p => p.id === productB.id);
    const tempOrder = newProducts[idxA].displayOrder;
    newProducts[idxA] = { ...newProducts[idxA], displayOrder: newProducts[idxB].displayOrder };
    newProducts[idxB] = { ...newProducts[idxB], displayOrder: tempOrder };

    setProducts(newProducts);

    try {
      await productsAPI.reorder([
        { id: productA.id, displayOrder: newProducts[idxA].displayOrder },
        { id: productB.id, displayOrder: newProducts[idxB].displayOrder }
      ]);
    } catch (error) {
      console.error('Erreur:', error);
      loadData();
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || 'Sans catégorie';
  };

  const filteredProducts = filterCategory === 'all'
    ? [...products].sort((a, b) => a.displayOrder - b.displayOrder)
    : filterCategory === 'none'
      ? [...products].filter(p => !p.categoryId).sort((a, b) => a.displayOrder - b.displayOrder)
      : [...products].filter(p => p.categoryId === parseInt(filterCategory)).sort((a, b) => a.displayOrder - b.displayOrder);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent mx-auto"></div>
          <p className="mt-4 text-text-muted">Chargement des produits...</p>
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
              Gestion des <span className="accent">Produits</span>
            </h1>
            <p className="text-text-muted text-lg">
              {products.length} produit(s) dans le catalogue
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary self-start md:self-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un produit
          </button>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 0 && (
          <div className="flex gap-3 mb-8 flex-wrap">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${
                filterCategory === 'all'
                  ? 'bg-accent text-primary'
                  : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10'
              }`}
            >
              Tous ({products.length})
            </button>
            {categories.map(cat => {
              const count = products.filter(p => p.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id.toString())}
                  className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${
                    filterCategory === cat.id.toString()
                      ? 'bg-accent text-primary'
                      : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
            <button
              onClick={() => setFilterCategory('none')}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-colors ${
                filterCategory === 'none'
                  ? 'bg-accent text-primary'
                  : 'bg-white/5 text-text-muted hover:text-white hover:bg-white/10'
              }`}
            >
              Sans catégorie ({products.filter(p => !p.categoryId).length})
            </button>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-space-grotesk text-2xl font-bold text-white mb-3">Aucun produit</h3>
            <p className="text-text-muted mb-6">Ajoutez votre premier produit pour commencer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group bg-[#0D2137] rounded-2xl border border-white/10 overflow-hidden hover:border-accent/50 transition-all duration-300"
              >
                {/* Product Image */}
                <div className="aspect-square bg-[#0A1931] flex items-center justify-center overflow-hidden relative">
                  {product.mockupFrontUrl ? (
                    <img
                      src={product.mockupFrontUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <svg className="w-20 h-20 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                  {/* Reorder buttons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveProduct(index, -1)}
                      disabled={index === 0}
                      className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-accent/80 transition-colors disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveProduct(index, 1)}
                      disabled={index === filteredProducts.length - 1}
                      className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-accent/80 transition-colors disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-space-grotesk text-lg font-semibold text-white">
                      {product.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      product.isActive
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {product.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.categoryId
                        ? 'bg-accent/10 text-accent border border-accent/20'
                        : 'bg-white/5 text-text-muted border border-white/10'
                    }`}>
                      {getCategoryName(product.categoryId)}
                    </span>
                  </div>

                  <p className="text-text-muted text-sm mb-4 line-clamp-2">
                    {product.description || 'Pas de description'}
                  </p>

                  <div className="mb-4">
                    <p className="text-text-muted text-xs">Prix de base</p>
                    <p className="text-accent font-bold text-xl">{product.basePrice.toFixed(2)} €</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-4 py-2.5 bg-accent text-primary rounded-xl font-medium text-sm hover:bg-accent/90 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-2.5 bg-white/5 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#0D2137] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="font-space-grotesk text-2xl font-bold text-white">
                {editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}
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
                  Nom du produit <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                  placeholder="Ex: T-shirt Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Catégorie <span className="text-accent">*</span>
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="" className="bg-[#0D2137]">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-[#0D2137]">
                      {cat.name} {cat.hasTwoSides ? '(Recto/Verso)' : '(Recto seul)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Description du produit..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Prix de base (€) <span className="text-accent">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                  placeholder="35.99"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Image Face
                  </label>
                  <ImageUpload
                    type="product"
                    currentImage={formData.mockupFrontUrl}
                    onImageUploaded={(image) => setFormData({ ...formData, mockupFrontUrl: image.url })}
                    aspectRatio="1/1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    Image Dos
                  </label>
                  <ImageUpload
                    type="product"
                    currentImage={formData.mockupBackUrl}
                    onImageUploaded={(image) => setFormData({ ...formData, mockupBackUrl: image.url })}
                    aspectRatio="1/1"
                  />
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
                  {editingProduct ? 'Mettre à jour' : 'Créer'}
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

export default AdminProducts;
