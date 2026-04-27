import { BestProductsSection } from "./components/sections/BestProducts/BestProductsSection";
import { ContactsSection } from "./components/sections/Contacts/ContactsSection";
import { Footer } from "./components/layout/Footer/Footer";
import { ProductPage } from "./components/pages/ProductPage/ProductPage";
import { getProductById } from "./data/bestProducts";
import { getSiteVariant } from "./utils/siteVariant";
import "./App.scss";

function App() {
  const productMatch = window.location.pathname.match(
    /^\/products\/([^/]+)\/?$/,
  );
  const siteVariant = getSiteVariant();

  if (productMatch) {
    const product = getProductById(productMatch[1]);

    if (product) {
      return <ProductPage product={product} siteVariant={siteVariant} />;
    }
  }

  return (
    <main className="page-shell">
      <BestProductsSection siteVariant={siteVariant} />
      <ContactsSection />
      <Footer />
    </main>
  );
}

export default App;
