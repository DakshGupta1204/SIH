import { Provider } from 'react-redux';
import { store } from './store';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Auth Pages
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

// Main Pages
import Index from "./pages/Index";

// Consumer Pages  
import { ConsumerHome } from "./pages/consumer/ConsumerHome";
import { ProductVerification } from "./pages/consumer/ProductVerification";
import { ScanStats } from './pages/consumer/ScanStats';
import Ecommerce from './pages/consumer/Ecommerce';
import Cart from './pages/consumer/Cart';
import { CartProvider } from './pages/consumer/CartContext';

// Farmer Pages
import { FarmerDashboard } from "./pages/farmer/FarmerDashboard";
import { NewCollection } from "./pages/farmer/NewCollection";
import { FarmerCollections } from "./pages/farmer/FarmerCollections";

// Lab Pages
import { LabDashboard } from "./pages/lab/LabDashboard";
import { QualityTest } from "./pages/lab/QualityTest";
import { ProcessingStep } from "./pages/lab/ProcessingStep";
import { NewProcessing } from "./pages/lab/NewProcessing";
import { BatchDetails } from './pages/lab/BatchDetails';

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/consumer" element={<ConsumerHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify/:qrCode" element={<ProductVerification />} />
            <Route path="/scan-stats/:batchId" element={<ScanStats />} />
            
            {/* Consumer Ecommerce Routes */}
            <Route path="/consumer/ecommerce" element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <CartProvider>
                  <Ecommerce />
                </CartProvider>
              </ProtectedRoute>
            } />
            <Route path="/consumer/cart" element={
              <ProtectedRoute allowedRoles={['consumer']}>
                <CartProvider>
                  <Cart />
                </CartProvider>
              </ProtectedRoute>
            } />
            
            {/* Farmer Routes */}
            <Route path="/farmer/dashboard" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/farmer/collection/new" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <NewCollection />
              </ProtectedRoute>
            } />
            <Route path="/farmer/collections" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerCollections />
              </ProtectedRoute>
            } />
            
            {/* Lab Routes */}
            <Route path="/lab/dashboard" element={
              <ProtectedRoute allowedRoles={['lab', 'processor']}>
                <LabDashboard />
              </ProtectedRoute>
            } />
            <Route path="/lab/processing/new" element={
              <ProtectedRoute allowedRoles={['lab', 'processor']}>
                <ProcessingStep />
              </ProtectedRoute>
            } />
            <Route path="/lab/processing/new-alt" element={
              <ProtectedRoute allowedRoles={['lab', 'processor']}>
                <NewProcessing />
              </ProtectedRoute>
            } />
            <Route path="/lab/quality-test" element={
              <ProtectedRoute allowedRoles={['lab']}>
                <QualityTest />
              </ProtectedRoute>
            } />
            <Route path="/lab/batch/:batchId" element={
              <ProtectedRoute allowedRoles={['lab', 'processor']}>
                <BatchDetails />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
