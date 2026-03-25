import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { CartProvider } from "@/context/CartContext";
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

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />

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

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster
            position="bottom-center"
            theme="dark"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                borderRadius: "14px",
              },
            }}
          />
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}
