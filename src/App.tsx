import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { getProductById } from "./data/bestProducts";
import { getAppPath } from "./utils/productUrl";
import { getSiteVariant } from "./utils/siteVariant";
import "./App.scss";
import { InformBlock } from "./components/sections/InformBlock/InformBlock";
import Advantages from "./components/sections/Advantages/Advantages";
import ContactForm from "./components/sections/ContactForm/ContactForm";
import { AuthProvider } from "./hooks/useAuth";
import { ShopProvider } from "./hooks/useShop";
import { RecentlyViewedProvider } from "./hooks/useRecentlyViewed";

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
  const siteVariant = getSiteVariant();

  let pageContent;

  if (appPath.match(/^\/login\/?$/)) {
    pageContent = <LoginPage />;
  } else if (appPath.match(/^\/(forgot-password|reset-password)\/?$/)) {
    pageContent = <ForgotPasswordPage />;
  } else if (appPath.match(/^\/register\/?$/)) {
    pageContent = <RegisterPage />;
  } else if (appPath.match(/^\/gallery\/?$/)) {
    pageContent = <GalleryPage siteVariant={siteVariant} />;
  } else if (appPath.match(/^\/about\/?$/)) {
    pageContent = <AboutPage siteVariant={siteVariant} />;
  } else if (appPath.match(/^\/reviews\/?$/)) {
    pageContent = <ReviewsPage siteVariant={siteVariant} />;
  } else if (appPath.match(/^\/account(\/.*)?$/)) {
    pageContent = <AccountPage siteVariant={siteVariant} />;
  } else if (productMatch) {
    const product = getProductById(productMatch[1]);
    pageContent = product ? (
      <ProductPage product={product} siteVariant={siteVariant} />
    ) : (
      <NotFoundPage
        description="Можливо, посилання застаріле або товар більше недоступний."
        siteVariant={siteVariant}
        title="Товар не знайдено"
      />
    );
  } else if (appPath.match(/^\/?$/)) {
    pageContent = <HomePage siteVariant={siteVariant} />;
  } else {
    pageContent = <NotFoundPage siteVariant={siteVariant} />;
  }

  return (
    <AuthProvider>
      <ShopProvider>
        <RecentlyViewedProvider>
          {pageContent}
        </RecentlyViewedProvider>
      </ShopProvider>
    </AuthProvider>
  );
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