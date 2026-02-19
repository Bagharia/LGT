import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Editor from './pages/Editor';
import PosterEditor from './pages/PosterEditor';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyDesigns from './pages/MyDesigns';
import PaymentSuccess from './pages/PaymentSuccess';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';

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
  const isEditorRoute = location.pathname.startsWith('/editor') || location.pathname.startsWith('/poster-editor');
  const isProductDetailRoute = location.pathname.startsWith('/product/');

  // Pages with new THREAD design (have their own layout)
  const fullPageRoutes = ['/', '/products', '/login', '/register', '/forgot-password', '/reset-password', '/my-designs', '/my-orders', '/checkout', '/payment-success', '/profile', '/admin', '/admin/orders', '/admin/products', '/admin/categories'];
  const isFullPageRoute = fullPageRoutes.includes(location.pathname) || isProductDetailRoute;

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
          <Route
            path="/poster-editor/:productId"
            element={
              <ProtectedRoute>
                <PosterEditor />
              </ProtectedRoute>
            }
          />
        </Routes>
      ) : isFullPageRoute ? (
        /* Pages with new THREAD design - Full page layout */
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
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
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
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
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminCategories />
              </ProtectedRoute>
            }
          />
        </Routes>
      ) : null}
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
