import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { designsAPI } from '../services/api';

const MyDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      const data = await designsAPI.getMy();
      setDesigns(data.designs);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des designs:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce design ?')) {
      return;
    }

    try {
      await designsAPI.delete(id);
      setDesigns(designs.filter(d => d.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du design');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border-2 border-black">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Designs</h1>
            <p className="text-gray-600 mt-2">Retrouvez tous vos designs personnalisés</p>
          </div>
          <Link
            to="/editor/2"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
          >
            Créer un nouveau design
          </Link>
        </div>
      </div>

      {/* Designs Grid */}
      {designs.length === 0 ? (
        <div className="bg-gray-100 rounded-xl border-2 border-gray-300 p-12 text-center">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun design pour le moment</h3>
          <p className="text-gray-600 mb-6">Commencez à créer vos T-shirts personnalisés dès maintenant !</p>
          <Link
            to="/editor/2"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
          >
            Créer mon premier design
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <div key={design.id} className="bg-white rounded-xl border-2 border-black overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="aspect-square bg-gray-100 flex items-center justify-center border-b-2 border-black">
                {design.frontPreviewUrl ? (
                  <img
                    src={design.frontPreviewUrl}
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 text-gray-900">{design.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Créé le {new Date(design.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/editor/${design.productId}?designId=${design.id}`}
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm text-center"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(design.id)}
                    className="px-4 py-2 bg-white text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDesigns;
