import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import {
  fetchPublicProducts,
  getFeaturedProducts,
  getProductIcon,
  getProductImageSrc,
  PRODUCTS_QUERY_KEY,
} from "@/lib/products";
import type { Product } from "@/lib/products";

const Products = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [...PRODUCTS_QUERY_KEY, "public"],
    queryFn: fetchPublicProducts,
  });
  const featuredProducts = getFeaturedProducts(products ?? []);
  
  return (
    <section id="products" className="py-20 bg-muted/30" ref={ref}>
      <div className="container px-4">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="text-primary">Product Range</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A curated look at the fertilizer lines we can tailor to your farm's needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [0, 1, 2].map((index) => (
              <Card
                key={index}
                className="overflow-hidden border-2"
              >
                <div className="h-48 bg-muted animate-pulse" />
                <CardHeader className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
                  <div className="h-7 w-2/3 rounded bg-muted animate-pulse" />
                  <div className="h-14 rounded bg-muted animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-16 rounded bg-muted animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product, index) => {
              const ProductIcon = getProductIcon(product.icon_key);

              return (
                <Card 
                  key={product.id}
                  className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 ${
                    isVisible ? 'animate-fade-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="h-48 overflow-hidden">
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
                    <CardDescription className="text-base">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {product.features.slice(0, 3).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <span className="w-2 h-2 rounded-full bg-primary mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="py-12 text-center text-muted-foreground">
                The product catalog is being refreshed. Check the full products page again shortly.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default Products;
