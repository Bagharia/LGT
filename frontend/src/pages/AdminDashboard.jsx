const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-gray-800">Dashboard Administrateur</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Produits</h3>
          <p className="text-3xl font-bold text-primary-600">-</p>
          <p className="text-sm text-gray-500 mt-2">Gérer les produits</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Commandes</h3>
          <p className="text-3xl font-bold text-primary-600">-</p>
          <p className="text-sm text-gray-500 mt-2">Voir les commandes</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Utilisateurs</h3>
          <p className="text-3xl font-bold text-primary-600">-</p>
          <p className="text-sm text-gray-500 mt-2">Gérer les utilisateurs</p>
        </div>
      </div>

      <div className="bg-primary-100 text-primary-800 p-8 rounded-xl">
        <p className="text-lg text-center">
          Le dashboard administrateur complet est en cours de développement.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
