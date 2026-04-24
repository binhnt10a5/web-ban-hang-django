import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage_new";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { UserDashboard } from "./pages/UserDashboard";
import { WishlistPage } from "./pages/WishlistPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminProductFormPage } from "./pages/admin/AdminProductFormPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminReviews } from "./pages/admin/AdminReviews";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProvidersWrapper } from "./components/ProvidersWrapper";

export const router = createBrowserRouter([
  {
    element: <ProvidersWrapper />,
    children: [
      {
        path: "/",
        Component: RootLayout,
        children: [
          { index: true, Component: HomePage },
          { path: "products", Component: ProductsPage },
          { path: "product/:id", Component: ProductDetailPage },
          { path: "cart", Component: CartPage },
          { path: "wishlist", Component: WishlistPage },
          { 
            path: "checkout", 
            element: <ProtectedRoute><CheckoutPage /></ProtectedRoute> 
          },
          { 
            path: "dashboard", 
            element: <ProtectedRoute><UserDashboard /></ProtectedRoute> 
          },
          // Admin routes
          { 
            path: "admin", 
            element: <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute> 
          },
          { 
            path: "admin/products", 
            element: <ProtectedRoute requireAdmin><AdminProductsPage /></ProtectedRoute> 
          },
          { 
            path: "admin/products/new", 
            element: <ProtectedRoute requireAdmin><AdminProductFormPage /></ProtectedRoute> 
          },
          { 
            path: "admin/products/edit/:id", 
            element: <ProtectedRoute requireAdmin><AdminProductFormPage /></ProtectedRoute> 
          },
          { 
            path: "admin/orders", 
            element: <ProtectedRoute requireAdmin><AdminOrdersPage /></ProtectedRoute> 
          },
          { 
            path: "admin/users", 
            element: <ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute> 
          },
          { 
            path: "admin/reviews", 
            element: <ProtectedRoute requireAdmin><AdminReviews /></ProtectedRoute> 
          },
          { path: "*", Component: NotFoundPage },
        ],
      },
      {
        path: "/login",
        Component: LoginPage,
      },
      {
        path: "/register",
        Component: RegisterPage,
      },
      {
        path: "/forgot-password",
        Component: ForgotPasswordPage,
      },
    ],
  },
]);