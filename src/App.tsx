import { useEffect, useState } from "react";
import { BestProductsSection } from "./components/sections/BestProducts/BestProductsSection";
import { ContactsSection } from "./components/sections/Contacts/ContactsSection";
import { ReviewsSection } from "./components/sections/Reviews/ReviewsSection";
import { Footer } from "./components/layout/Footer/Footer";
import { Header } from "./components/layout/Header/Header";
import { GalleryPage } from "./components/pages/GalleryPage/GalleryPage";
import { ProductPage } from "./components/pages/ProductPage/ProductPage";
import { getProductById } from "./data/bestProducts";
import { getAppPath } from "./utils/productUrl";
import { getSiteVariant } from "./utils/siteVariant";
import "./App.scss";
import { InformBlock } from "./components/sections/InformBlock/InformBlock";
import Advantages from "./components/sections/Advantages/Advantages";


function App() {
  const [, setLocationKey] = useState(() => window.location.href);

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

  const appPath = getAppPath(window.location.pathname, window.location.hash);
  const productMatch = appPath.match(/^\/products\/([^/]+)\/?$/);
  const siteVariant = getSiteVariant();

  if (appPath.match(/^\/gallery\/?$/)) {
    return <GalleryPage siteVariant={siteVariant} />;
  }

  if (productMatch) {
    const product = getProductById(productMatch[1]);

    if (product) {
      return <ProductPage product={product} siteVariant={siteVariant} />;
    }
  }

  return (
    <main className="page-shell">
      <Header activePage="home" siteVariant={siteVariant} />
      <InformBlock siteVariant={siteVariant}/>
      <Advantages />
      <BestProductsSection siteVariant={siteVariant} />
      <ReviewsSection />
      <ContactsSection />
      <Footer />
    </main>
  );
}

export default App;
