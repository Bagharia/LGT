import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Editor from './pages/Editor';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import MyDesigns from './pages/MyDesigns';
import PaymentSuccess from './pages/PaymentSuccess';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';

// User Pages
import Profile from './pages/user/Profile';
import MyOrders from './pages/user/MyOrders';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route (redirect to home if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const location = useLocation();
  const isEditorRoute = location.pathname.startsWith('/editor');

  return (
    <>
      {/* Editor Route - Full Screen (no navbar/footer) */}
      {isEditorRoute ? (
        <Routes>
          <Route
            path="/editor/:productId"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />
        </Routes>
      ) : (
        /* All other routes - With Layout */
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />

          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />

              {/* Auth Routes (redirect if already logged in) */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected Routes (require authentication) */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-designs"
                element={
                  <ProtectedRoute>
                    <MyDesigns />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-success"
                element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes (require admin role) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-gray-800 text-white mt-auto">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4">LGT Custom T-Shirts</h3>
                  <p className="text-gray-400">
                    Créez vos t-shirts personnalisés avec notre éditeur en ligne.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">Liens rapides</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="/products" className="hover:text-white">Produits</a></li>
                    <li><a href="/login" className="hover:text-white">Connexion</a></li>
                    <li><a href="/register" className="hover:text-white">Inscription</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-4">Contact</h3>
                  <p className="text-gray-400">
                    Email: contact@lgt-tshirts.com<br />
                    Téléphone: +33 1 23 45 67 89
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2025 LGT Custom T-Shirts. Tous droits réservés.</p>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
