import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Import components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import PageTransition from "./components/PageTransition";
import ShopLayout from "./components/ShopLayout";

// Import pages
import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import Contact from "./pages/Contact/Contact";
import AboutUs from "./pages/AboutUs/AboutUs";
import Blog from "./pages/Blog/Blog";
import ProductDetail from "./pages/ProductsDetail/ProductDetail";
import BlogDetail from "./pages/Blog/BlogDetail";
import Login from "./pages/Login/Login";
import Cart from "./pages/Cart/Cart";
import Profile from "./pages/Profile/Profile";
import ShopProducts from "./pages/ProductsShop/ShopProducts";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassWord/Forgot-password";
import AdminLayout from "./pages/Admin/AdminLayout";
import DashboardHome from "./pages/Admin/DashboardHome";
import ProductsManager from "./pages/Admin/ProductsManager";
import PostsManager from "./pages/Admin/PostsManager";
import ShopProfile from "./pages/ShopProfile/ShopProfile";
import Shop from "./pages/Shop/Shop";
import ProductsShop from "./pages/ProductsInShop/ProductsShop";
import OrderShop from "./pages/OrderShop/OrderShop";
import UsersManagement from "./pages/Admin/UsersManagement";
import ShopsManagement from "./pages/Admin/ShopsManagement";
import BlogManagementUser from "./components/Profile/BlogManagement";
import ShopBlogManager from "./components/ShopBlogManager";
import AdminBlogManager from "./components/AdminBlogManager";
import RegisterShop from "./pages/RegisterShop/RegisterShop";

// Dummy shop pages


// RoleEnum mapping
const RoleEnum = {
  Admin: 1,
  Shop: 2,
  User: 3,
};

function getRole() {
  const role = localStorage.getItem("role");
  if (!role) return null;
  if (role === "Admin") return RoleEnum.Admin;
  if (role === "Shop") return RoleEnum.Shop;
  if (role === "User") return RoleEnum.User;
  return null;
}

// Component để kiểm tra vai trò và render layout
const AppContent = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const isRegisterShop = location.pathname === "/register-shop";
  const isRegister = location.pathname === "/register";
  const isForgotPassword = location.pathname === "/forgot-password";
  const isProfile = location.pathname === "/settings";
  const role = getRole();

  // Nếu là Admin, dùng AdminLayout với các route
  if (role === RoleEnum.Admin && location.pathname.startsWith("/admin")) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<UsersManagement />} />

          <Route path="posts" element={<PostsManager />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="shops" element={<ShopsManagement />} />
          <Route path="blogs" element={<AdminBlogManager />} />
        </Route>
      </Routes>
    );
  }

  // Nếu là Shop, dùng ShopLayout với các route
  if (role === RoleEnum.Shop && location.pathname.startsWith("/shop")) {
    return (
      <ShopLayout>
        <Routes>
          <Route path="/shop" element={<Navigate to="/shop/profile" replace />} />
          <Route path="/shop/orders" element={<OrderShop />} />
          <Route path="/shop/products" element={<ShopProducts />} />
          <Route path="/shop/profile" element={<ShopProfile />} />
          <Route path="/shop/blog" element={<ShopBlogManager />} />
        </Routes>
      </ShopLayout>
    );
  }

  // Mặc định là User
  return (
    <div className="App">
      {!isLogin && !isRegister && !isForgotPassword && !isRegisterShop && <Navbar />}
      <main>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register-shop" element={<RegisterShop />} />
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/products"
            element={
              <PageTransition>
                <Products />
              </PageTransition>
            }
          />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <Contact />
              </PageTransition>
            }
          />
          <Route
            path="/shop"
            element={
              <PageTransition>
                <Shop />
              </PageTransition>
            }
          />
          <Route path="/shop/:shopId/products" element={
            <PageTransition>
              <ProductsShop />
            </PageTransition>

          } />
          <Route
            path="/about"
            element={
              <PageTransition>
                <AboutUs />
              </PageTransition>
            }
          />
          <Route
            path="/cart"
            element={
              <PageTransition>
                <Cart />
              </PageTransition>
            }
          />
          <Route
            path="/my-blogs"
            element={

              <BlogManagementUser />

            }
          />
          <Route
            path="/blog"
            element={
              <PageTransition>
                <Blog />
              </PageTransition>
            }
          />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/settings" element={<Profile />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="posts" element={<PostsManager />} />
          </Route>
        </Routes>
      </main>
      {/* Không hiện Footer và ScrollToTop khi ở trang login, register hoặc forgot password */}
      {!isLogin && !isRegister && !isForgotPassword && !isProfile && !isRegisterShop && <Footer />}
      {!isLogin && !isRegister && !isForgotPassword && !isRegisterShop && <ScrollToTop />}
    </div>
  );
};

export default function AppWithRouter() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}