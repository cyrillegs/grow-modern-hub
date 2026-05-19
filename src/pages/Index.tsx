import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Products from "@/components/Products";
import Benefits from "@/components/Benefits";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { PageMeta } from "@/components/seo/PageMeta";
import {
  BRAND_NAME,
  OWNER_EMAIL,
  SITE_URL,
  WHATSAPP_PHONE,
  WHATSAPP_PROFILE_URL,
  buildAbsoluteUrl,
} from "@/lib/seo";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND_NAME,
  url: SITE_URL,
  logo: buildAbsoluteUrl("/og-image.jpg"),
  email: OWNER_EMAIL,
  telephone: WHATSAPP_PHONE,
  areaServed: "PH",
  sameAs: [WHATSAPP_PROFILE_URL],
};

const Index = () => {
  return (
    <div className="min-h-screen">
      <PageMeta path="/">
        <script type="application/ld+json">
          {JSON.stringify(organizationJsonLd)}
        </script>
      </PageMeta>
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Products />
        <Benefits />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
