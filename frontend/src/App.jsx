import { lazy, Suspense, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ScrollToTop from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";
import Spinner from "./components/common/Spinner";
import SplashScreen from "./components/common/SplashScreen";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Movies = lazy(() => import("./pages/Movies"));
const TvShows = lazy(() => import("./pages/TvShows"));
const WebSeriesPage = lazy(() => import("./pages/WebSeriesPage"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const TvShowDetails = lazy(() => import("./pages/TvShowDetails"));
const WebSeriesDetails = lazy(() => import("./pages/WebSeriesDetails"));
const Watch = lazy(() => import("./pages/Watch"));
const Search = lazy(() => import("./pages/Search"));

const ContinueWatchingPage = lazy(() => import("./pages/ContinueWatchingPage"));
const History = lazy(() => import("./pages/History"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Payment = lazy(() => import("./pages/Payment"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Faq = lazy(() => import("./pages/Faq"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const Categories = lazy(() => import("./pages/Categories"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const GenrePage = lazy(() => import("./pages/GenrePage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ScriptGenerator = lazy(() => import("./pages/ScriptGenerator"));
const UploadMovie = lazy(() => import("./pages/admin/UploadMovie"));
const EditMovie = lazy(() => import("./pages/admin/EditMovie"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const ManageReviews = lazy(() => import("./pages/admin/ManageReviews"));
const ManageSubscriptions = lazy(() => import("./pages/admin/ManageSubscriptions"));
const ManageBrands = lazy(() => import("./pages/admin/ManageBrands"));
const ChannelPage = lazy(() => import("./pages/ChannelPage"));
const CreatorDashboard = lazy(() => import("./pages/CreatorDashboard"));
const SubscriptionsFeed = lazy(() => import("./pages/SubscriptionsFeed"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen key="splash" onFinish={() => setShowSplash(false)} />
      ) : (
        <Suspense key="main-app" fallback={<Spinner fullScreen />}>
          <ScrollToTop />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/:slug" element={<MovieDetails />} />
              <Route path="/tv-shows" element={<TvShows />} />
              <Route path="/tv-shows/:slug" element={<TvShowDetails />} />
              <Route path="/web-series" element={<WebSeriesPage />} />
              <Route path="/web-series/:slug" element={<WebSeriesDetails />} />
              <Route path="/search" element={<Search />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/genre/:genreId" element={<GenrePage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/channel/:slug" element={<ChannelPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/watch/:type/:slug" element={<Watch />} />
                <Route path="/upload-movie" element={<UploadMovie />} />
                <Route path="/edit-movie/:id" element={<EditMovie />} />
                <Route path="/continue-watching" element={<ContinueWatchingPage />} />
                <Route path="/history" element={<History />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/watchlist" element={<Watchlist />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/payment/:planId" element={<Payment />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/ai/script" element={<ScriptGenerator />} />
                <Route path="/creator-studio" element={<CreatorDashboard />} />
                <Route path="/subscriptions-feed" element={<SubscriptionsFeed />} />
              </Route>
            </Route>
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/reviews" element={<ManageReviews />} />
                <Route path="/admin/subscriptions" element={<ManageSubscriptions />} />
                <Route path="/admin/brands" element={<ManageBrands />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      )}
    </AnimatePresence>
  );
}
