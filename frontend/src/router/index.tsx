import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import LoginPage          from '../features/auth/pages/LoginPage';
import SignupPage         from '../features/auth/pages/SignupPage';
import OAuthSuccess       from '../features/auth/pages/OAuthSuccess';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import NotFoundPage       from '../features/auth/pages/NotFoundPage';
import LandingPage        from '../features/auth/pages/LandingPage';

const HomePage            = lazy(() => import('../features/home/pages/HomePage'));
const ChatPage            = lazy(() => import('../features/chat/pages/ChatPage'));
const ListingDetailPage   = lazy(() => import('../features/listings/pages/ListingDetailPage'));
const CreateListingPage   = lazy(() => import('../features/listings/pages/CreateListingPage'));
const ProfilePage         = lazy(() => import('../features/profile/pages/ProfilePage'));
const BuyerDashboard      = lazy(() => import('../features/dashboard/pages/BuyerDashboard'));
const SellerDashboard     = lazy(() => import('../features/dashboard/pages/SellerDashboard'));
const WholesalerDashboard = lazy(() => import('../features/dashboard/pages/WholesalerDashboard'));
const Explore  = lazy(() => import('../features/home/pages/SearchPage'));

const Spinner = () => (
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#000' }}>
    <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid rgba(34,197,94,0.2)', borderTopColor:'#22c55e', animation:'spin 0.7s linear infinite' }} />
  </div>
);

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Landing */}
          <Route path="/"                      element={<LandingPage />} />

          {/* Auth */}
          <Route path="/login"                 element={<LoginPage />} />
          <Route path="/register"              element={<SignupPage />} />
          <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
          <Route path="/reset-password"        element={<ForgotPasswordPage />} />
          <Route path="/oauth/success"         element={<OAuthSuccess />} />

          {/* App */}
          <Route path="/home"                  element={<HomePage />} />
          <Route path="/chat"                  element={<ChatPage />} />
          <Route path="/chat/:id"              element={<ChatPage />} />
          <Route path="/explore"               element={<Explore />} />

          {/* Listing detail — /listing/lst_001 style */}
          <Route path="/listing/:id"           element={<ListingDetailPage />} />
          <Route path="/listings/new"          element={<CreateListingPage />} />

          {/* Dashboards */}
          <Route path="/profile/:id"           element={<ProfilePage />} />
          <Route path="/buyer/dashboard"       element={<BuyerDashboard />} />
          <Route path="/seller/dashboard"      element={<SellerDashboard />} />
          <Route path="/wholesaler/dashboard"  element={<WholesalerDashboard />} />

          {/* 404 */}
          <Route path="*"                      element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
