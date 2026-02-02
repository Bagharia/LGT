import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../services/api';
import Header from '../../components/Header';
import ImageUpload from '../../components/ImageUpload';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    spreadshirtProductId: '',
    mockupFrontUrl: '',
    mockupBackUrl: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getAllAdmin();
      setProducts(data.products || []);
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
        spreadshirtProductId: parseInt(formData.spreadshirtProductId)
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData);
      } else {
        await productsAPI.create(productData);
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        spreadshirtProductId: '',
        mockupFrontUrl: '',
        mockupBackUrl: ''
      });
      loadProducts();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      basePrice: product.basePrice.toString(),
      spreadshirtProductId: product.spreadshirtProductId?.toString() || '',
      mockupFrontUrl: product.mockupFrontUrl || '',
      mockupBackUrl: product.mockupBackUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver ce produit ?')) {
      return;
    }
    try {
      await productsAPI.delete(id);
      loadProducts();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

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
      {/* Header */}
      <Header />

      {/* Main Content */}
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
              setFormData({
                name: '',
                description: '',
                basePrice: '',
                spreadshirtProductId: '',
                mockupFrontUrl: '',
                mockupBackUrl: ''
              });
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

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-[#111] rounded-2xl border border-white/10 p-12 text-center">
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
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-[#111] rounded-2xl border border-white/10 overflow-hidden hover:border-accent/50 transition-all duration-300"
              >
                {/* Product Image */}
                <div className="aspect-square bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
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
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
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

                  <p className="text-text-muted text-sm mb-4 line-clamp-2">
                    {product.description || 'Pas de description'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-text-muted text-xs">Prix de base</p>
                      <p className="text-accent font-bold text-xl">{product.basePrice.toFixed(2)} €</p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-muted text-xs">ID Spreadshirt</p>
                      <p className="text-white font-medium">{product.spreadshirtProductId || 'N/A'}</p>
                    </div>
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
            className="bg-[#111] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">
                    ID Spreadshirt <span className="text-accent">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.spreadshirtProductId}
                    onChange={(e) => setFormData({ ...formData, spreadshirtProductId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                    placeholder="812"
                  />
                </div>
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
