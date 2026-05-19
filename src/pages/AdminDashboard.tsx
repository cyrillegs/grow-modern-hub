import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { ProductsPanel } from "@/components/admin/ProductsPanel";
import { QuotesPanel } from "@/components/admin/QuotesPanel";
import { ContactsPanel } from "@/components/admin/ContactsPanel";
import { PageMeta } from "@/components/seo/PageMeta";

type DashboardTab = "quotes" | "contacts" | "products";

const isValidTab = (value: string | null): value is DashboardTab =>
  value === "quotes" || value === "contacts" || value === "products";

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tab: DashboardTab = isValidTab(searchParams.get("tab"))
    ? (searchParams.get("tab") as DashboardTab)
    : "quotes";

  const setTab = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <PageMeta path="/admin" title="Admin Dashboard | GreenGrows" noindex />
      <Navbar />
      <main className="pt-16">
        <div className="container px-4 py-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage products, quote requests, and contact messages from one place.
              </p>
            </div>
            <Button variant="outline" onClick={signOut} className="gap-2 self-start">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>
            <TabsContent value="products">
              <ProductsPanel />
            </TabsContent>
            <TabsContent value="quotes">
              <QuotesPanel />
            </TabsContent>
            <TabsContent value="contacts">
              <ContactsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
