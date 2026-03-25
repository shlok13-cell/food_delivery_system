import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Restaurants from "@/pages/restaurants";
import RestaurantDetail from "@/pages/restaurant-detail";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import NotFound from "@/pages/not-found";
import DashboardLayout from "@/pages/dashboard/layout";
import DashboardMenu from "@/pages/dashboard/menu";
import DashboardOrders from "@/pages/dashboard/orders";
import DeliveryLayout from "@/pages/delivery/layout";
import DeliveryAssignments from "@/pages/delivery/assignments";
import AssignmentDetail from "@/pages/delivery/assignment-detail";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderTracking from "@/pages/track/order-tracking";
import AdminLayout from "@/pages/admin/layout";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminUsers from "@/pages/admin/users";
import AdminOrders from "@/pages/admin/orders";
import AdminRestaurants from "@/pages/admin/restaurants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" as const } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15, ease: "easeIn" as const } },
};

function AppRoutes() {
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ minHeight: "100vh" }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/track/:orderId" element={<OrderTracking />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["restaurant", "admin"]}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="menu" replace />} />
              <Route path="menu" element={<DashboardMenu />} />
              <Route path="orders" element={<DashboardOrders />} />
            </Route>

            <Route
              path="/delivery"
              element={
                <ProtectedRoute allowedRoles={["delivery", "admin"]}>
                  <DeliveryLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="assignments" replace />} />
              <Route path="assignments" element={<DeliveryAssignments />} />
              <Route path="assignments/:id" element={<AssignmentDetail />} />
            </Route>

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="analytics" replace />} />
              <Route path="analytics"   element={<AdminAnalytics />}   />
              <Route path="users"       element={<AdminUsers />}       />
              <Route path="orders"      element={<AdminOrders />}      />
              <Route path="restaurants" element={<AdminRestaurants />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <Toaster
        position="bottom-right"
        theme={theme}
        richColors
        closeButton
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "14px",
            fontFamily: "Inter, system-ui, sans-serif",
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
