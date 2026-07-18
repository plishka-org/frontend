import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BestProductsSection } from "./components/sections/BestProducts/BestProductsSection";
import { ContactsSection } from "./components/sections/Contacts/ContactsSection";
import { ReviewsSection } from "./components/sections/Reviews/ReviewsSection";
import { Footer } from "./components/layout/Footer/Footer";
import { Header } from "./components/layout/Header/Header";
import { AboutPage } from "./components/pages/AboutPage/AboutPage";
import { GalleryPage } from "./components/pages/GalleryPage/GalleryPage";
import { NotFoundPage } from "./components/pages/NotFoundPage/NotFoundPage";
import { ProductPage } from "./components/pages/ProductPage/ProductPage";
import { ReviewsPage } from "./components/pages/ReviewsPage/ReviewsPage";
import { AccountPage } from "./components/pages/AccountPage/AccountPage";
import { LoginPage } from "./components/pages/LoginPage/LoginPage";
import { ForgotPasswordPage } from "./components/pages/ForgotPasswordPage/ForgotPasswordPage";
import { RegisterPage } from "./components/pages/RegisterPage/RegisterPage";
import { FavoritesPage } from "./components/pages/FavoriteProductPage/FavoritesPage";
import { getProductById } from "./data/bestProducts";
import { getProductApi, type ProductUi } from "./services/api/productsApi";
import { hasApiBaseUrl } from "./services/api/client";
import { getSettingsApi } from './services/api/contentApi'
import { getAppPath } from "./utils/productUrl";
import { getRequestedSiteVariant, getSiteVariant } from "./utils/siteVariant";
import "./App.scss";
import { InformBlock } from "./components/sections/InformBlock/InformBlock";
import Advantages from "./components/sections/Advantages/Advantages";
import ContactForm from "./components/sections/ContactForm/ContactForm";
import { AuthProvider } from "./hooks/useAuth";
import { ShopProvider } from "./hooks/useShop";
import { RecentlyViewedProvider } from "./hooks/useRecentlyViewed";
import { ToastProvider } from "./hooks/useToast";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { AdminLayout } from "./components/layout/AdminLayout/AdminLayout";
import { AdminPersonalDataPage } from "./components/pages/AdminPersonalDataPage/AdminPersonalDataPage";
import { AdminProductsPage } from "./components/pages/AdminProductsPage/AdminProductsPage";
import { AdminContentPage } from "./components/pages/AdminContentPage/AdminContentPage";
import { AdminReviewsPage } from "./components/pages/AdminReviewsPage/AdminReviewsPage";
import { AdminClientsPage } from "./components/pages/AdminClientsPage/AdminClientsPage";
import { AdminOrdersPage } from "./components/pages/AdminOrdersPage/AdminOrdersPage";
import { AdminCategoriesPage } from "./components/pages/AdminCategoriesPage/AdminCategoriesPage";

function App() {
  const [, setLocationKey] = useState(() => window.location.href);
  const appPath = getAppPath(window.location.pathname, window.location.hash);
  const previousAppPathRef = useRef(appPath);

  useEffect(() => {
    function updateLocationKey() {
      setLocationKey(window.location.href);
    }

    window.addEventListener("hashchange", updateLocationKey);
    window.addEventListener("popstate", updateLocationKey);

    return () => {
      window.removeEventListener("hashchange", updateLocationKey);
      window.removeEventListener("popstate", updateLocationKey);
    };
  }, []);

  useLayoutEffect(() => {
    if (previousAppPathRef.current === appPath) {
      return;
    }

    previousAppPathRef.current = appPath;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [appPath]);

  const productMatch = appPath.match(/^\/products\/([^/]+)\/?$/);
  const requestedVariant = getRequestedSiteVariant();
  const fallbackVariant = getSiteVariant();
  const [siteVariant, setSiteVariant] = useState(fallbackVariant)

  useEffect(() => {
    if (requestedVariant) {
      return
    }

    if (!hasApiBaseUrl()) return
    getSettingsApi().then((settings) => setSiteVariant(settings.isShopModeEnabled ? 'order' : 'usual')).catch(() => setSiteVariant(fallbackVariant))
  }, [fallbackVariant, requestedVariant])
  const activeSiteVariant = requestedVariant ?? siteVariant
  const adminMatch = appPath.match(/^\/admin\/?(.*)$/);

  let pageContent;

  if (appPath.match(/^\/login\/?$/)) {
    pageContent = <LoginPage />;
  } else if (appPath.match(/^\/(forgot-password|reset-password)\/?$/)) {
    pageContent = <ForgotPasswordPage />;
  } else if (appPath.match(/^\/register\/?$/)) {
    pageContent = <RegisterPage />;
  } else if (adminMatch) {
    const adminKey = adminMatch[1]?.split("/")[0] || "products";
    pageContent = (
      <ProtectedRoute>
        <AdminLayout activeKey={adminKey}>
          {adminKey === "settings" ? (
            <AdminPersonalDataPage />
          ) : adminKey === "products" ? (
            <AdminProductsPage />
          ) : adminKey === "categories" ? (
            <AdminCategoriesPage />
          ) : adminKey === "reviews" ? (
            <AdminReviewsPage />
          ) : adminKey === "clients" ? (
            <AdminClientsPage />
          ) : adminKey === "orders" ? (
            <AdminOrdersPage />
          ) : adminKey === "more" ? (
            <AdminContentPage />
          ) : (
            <div>
              Контент розділу «{adminKey}» (буде реалізовано в наступних
              тасках)
            </div>
          )}
        </AdminLayout>
      </ProtectedRoute>
    );
  } else if (appPath.match(/^\/gallery\/?$/)) {
    pageContent = <GalleryPage siteVariant={activeSiteVariant} />;
  } else if (appPath.match(/^\/about\/?$/)) {
    pageContent = <AboutPage siteVariant={activeSiteVariant} />;
  } else if (appPath.match(/^\/reviews\/?$/)) {
    pageContent = <ReviewsPage siteVariant={activeSiteVariant} />;
  } else if (appPath.match(/^\/favorites\/?$/)) {
    pageContent = <FavoritesPage siteVariant={activeSiteVariant} />;
  } else if (appPath.match(/^\/account(\/.*)?$/)) {
    pageContent = <AccountPage siteVariant={activeSiteVariant} />;
  } else if (productMatch) {
    pageContent = (
      <ProductRoute
        key={productMatch[1]}
        productId={productMatch[1]}
        siteVariant={activeSiteVariant}
      />
    );
  } else if (appPath.match(/^\/?$/)) {
    pageContent = <HomePage siteVariant={activeSiteVariant} />;
  } else {
    pageContent = <NotFoundPage siteVariant={activeSiteVariant} />;
  }

  return (
    <AuthProvider>
      <ShopProvider>
        <RecentlyViewedProvider>
          <ToastProvider>
            {pageContent}
          </ToastProvider>
        </RecentlyViewedProvider>
      </ShopProvider>
    </AuthProvider>
  );
}

function ProductRoute({
  productId,
  siteVariant,
}: {
  productId: string;
  siteVariant: ReturnType<typeof getSiteVariant>;
}) {
  const localProduct = useMemo(() => getProductById(productId), [productId]);
  const [product, setProduct] = useState<ProductUi | undefined>(localProduct);
  const [isNotFound, setIsNotFound] = useState(!localProduct);

  useEffect(() => {
    if (!hasApiBaseUrl() || !Number.isFinite(Number(productId))) {
      return;
    }

    let isCancelled = false;

    getProductApi(productId)
      .then((nextProduct) => {
        if (!isCancelled) {
          setProduct(nextProduct);
          setIsNotFound(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setProduct(localProduct);
          setIsNotFound(!localProduct);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [localProduct, productId]);

  if (isNotFound || !product) {
    return (
      <NotFoundPage
        description="Можливо, посилання застаріле або товар більше недоступний."
        siteVariant={siteVariant}
        title="Товар не знайдено"
      />
    );
  }

  return <ProductPage product={product} siteVariant={siteVariant} />;
}

function HomePage({
  siteVariant,
}: {
  siteVariant: ReturnType<typeof getSiteVariant>;
}) {
  return (
    <main className="page-shell">
      <Header activePage="home" siteVariant={siteVariant} />
      <InformBlock siteVariant={siteVariant} />
      <Advantages />
      <BestProductsSection siteVariant={siteVariant} />
      <ReviewsSection siteVariant={siteVariant} />
      <ContactForm />
      <ContactsSection />
      <Footer />
    </main>
  );
}

export default App;
