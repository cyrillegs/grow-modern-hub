import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RequestQuoteDialog } from "@/components/RequestQuoteDialog";
import {
  fetchPublicProducts,
  getProductIcon,
  getProductImageSrc,
  PRODUCTS_QUERY_KEY,
} from "@/lib/products";
import type { Product } from "@/lib/products";

const Products = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.05);
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [...PRODUCTS_QUERY_KEY, "public"],
    queryFn: fetchPublicProducts,
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <section className="py-20 bg-muted/30" ref={headerRef}>
          <div className="container px-4">
            <div
              className={`text-center mb-16 transition-all duration-700 ${
                headerVisible ? "animate-fade-up" : "opacity-0"
              }`}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Our <span className="text-primary">Products</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover our comprehensive range of premium fertilizers designed
                to maximize crop yields and promote sustainable agriculture
              </p>
            </div>

            <div
              ref={gridRef}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto"
            >
              {isLoading ? (
                [0, 1, 2, 3, 4, 5].map((index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border-2"
                  >
                    <div className="h-56 bg-muted animate-pulse" />
                    <CardHeader className="space-y-3">
                      <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                      <div className="h-7 w-2/3 rounded bg-muted animate-pulse" />
                      <div className="h-14 rounded bg-muted animate-pulse" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="h-16 rounded bg-muted animate-pulse" />
                      <div className="h-24 rounded bg-muted animate-pulse" />
                    </CardContent>
                  </Card>
                ))
              ) : products && products.length > 0 ? (
                products.map((product, index) => {
                  const ProductIcon = getProductIcon(product.icon_key);

                  return (
                    <Card
                      key={product.id}
                      className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 ${
                        gridVisible ? "animate-fade-up" : "opacity-0"
                      }`}
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <div className="h-56 overflow-hidden">
                        <img
                          src={getProductImageSrc(product.image_key)}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <CardHeader>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <ProductIcon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">{product.name}</CardTitle>
                        <CardDescription className="text-base">
                          {product.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">
                            Key Features:
                          </h4>
                          <ul className="space-y-2">
                            {product.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-start text-sm">
                                <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-4 border-t space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              NPK Ratio:
                            </span>
                            <Badge variant="secondary">{product.npk}</Badge>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Application:
                            </span>
                            <p className="text-foreground mt-1">
                              {product.application}
                            </p>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Coverage:
                            </span>
                            <p className="text-foreground mt-1">
                              {product.coverage}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col gap-3 border-t pt-6">
                        <div className="w-full text-center">
                          <p className="text-lg font-bold text-primary">
                            {product.price}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Indicative — final pricing depends on quantity & delivery
                          </p>
                        </div>
                        <RequestQuoteDialog
                          product={product.name}
                          trigger={
                            <Button className="w-full">Request Quote</Button>
                          }
                        />
                      </CardFooter>
                    </Card>
                  );
                })
              ) : (
                <Card className="lg:col-span-2 xl:col-span-3">
                  <CardContent className="py-16 text-center text-muted-foreground">
                    No products are published right now. Please check back soon.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
