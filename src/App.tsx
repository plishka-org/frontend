import { ContactsSection } from "./components/sections/Contacts/ContactsSection";
import { Footer } from "./components/layout/Footer/Footer";
import "./App.scss";

function App() {
  return (
    <main className="page-shell">
      <ContactsSection />
      <Footer />
    </main>
  );
}

export default App;
