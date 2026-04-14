import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import LoginPage          from '../features/auth/pages/LoginPage';
import SignupPage         from '../features/auth/pages/SignupPage';
import OAuthSuccess       from '../features/auth/pages/OAuthSuccess';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import NotFoundPage       from '../features/auth/pages/NotFoundPage';
import LandingPage        from '../features/auth/pages/LandingPage';
import VerifyEmail        from '../features/auth/components/verifyEmail';

const HomePage            = lazy(() => import('../features/home/pages/HomePage'));
const TrendingPage        = lazy(() => import('../features/home/pages/TrendingPage'));
const NearMePage          = lazy(() => import('../features/home/pages/NearMePage'));
const TopSellersPage      = lazy(() => import('../features/home/pages/TopSellersPage'));
const SavedPage           = lazy(() => import('../features/home/pages/SavedPage'));
const ChatPage            = lazy(() => import('../features/chat/pages/ChatPage'));
const ListingDetailPage   = lazy(() => import('../features/listings/pages/ListingDetailPage'));
const CreateListingPage   = lazy(() => import('../features/listings/pages/CreateListingPage'));
const ListingsPage        = lazy(() => import('../features/listings/pages/ListingsPage'));
const ProfilePage         = lazy(() => import('../features/profile/pages/ProfilePage'));
const AccountPage         = lazy(() => import('../features/profile/pages/AccountPage'));
const SettingsPage        = lazy(() => import('../features/profile/pages/SettingsPage'));
const BuyerDashboard      = lazy(() => import('../features/dashboard/pages/BuyerDashboard'));
const SellerDashboard     = lazy(() => import('../features/dashboard/pages/SellerDashboard'));
const WholesalerDashboard = lazy(() => import('../features/dashboard/pages/WholesalerDashboard'));
const Explore  = lazy(() => import('../features/home/pages/SearchPage'));

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          {/* Landing */}
          <Route path="/"                      element={<LandingPage />} />

          {/* Auth */}
          <Route path="/login"                 element={<LoginPage />} />
          <Route path="/register"              element={<SignupPage />} />
          <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
          <Route path="/reset-password"        element={<ForgotPasswordPage />} />
          <Route path="/oauth/success"         element={<OAuthSuccess />} />
          <Route path="/verify-email"          element={<VerifyEmail />} />

          {/* App */}
          <Route path="/home"                  element={<HomePage />} />
          <Route path="/trending"              element={<TrendingPage />} />
          <Route path="/near-me"               element={<NearMePage />} />
          <Route path="/top-sellers"           element={<TopSellersPage />} />
          <Route path="/saved"                 element={<SavedPage />} />
          <Route path="/chat"                  element={<ChatPage />} />
          <Route path="/chat/:id"              element={<ChatPage />} />
          <Route path="/explore"               element={<Explore />} />

          {/* Listing detail — /listing/lst_001 style */}
          <Route path="/listings"              element={<ListingsPage />} />
          <Route path="/listing/:id"           element={<ListingDetailPage />} />
          <Route path="/listings/new"          element={<CreateListingPage />} />

          {/* Dashboards */}
          <Route path="/profile/:id"           element={<ProfilePage />} />
          <Route path="/account"               element={<AccountPage />} />
          <Route path="/settings"              element={<SettingsPage />} />
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
