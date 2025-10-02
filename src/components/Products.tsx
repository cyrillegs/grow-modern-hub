import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Droplets, Sprout } from "lucide-react";
import organicImage from "@/assets/fertilizer-organic.jpg";
import liquidImage from "@/assets/fertilizer-liquid.jpg";
import specialtyImage from "@/assets/fertilizer-specialty.jpg";

const products = [
  {
    title: "Organic Fertilizers",
    description: "Natural, eco-friendly solutions that enrich soil health and promote sustainable farming practices.",
    icon: Leaf,
    image: organicImage,
    features: ["100% Natural", "Soil Enrichment", "Long-lasting"],
  },
  {
    title: "Liquid Solutions",
    description: "Fast-acting liquid fertilizers for immediate nutrient delivery and rapid plant response.",
    icon: Droplets,
    image: liquidImage,
    features: ["Quick Absorption", "Precise Application", "Water Soluble"],
  },
  {
    title: "Specialty Formulas",
    description: "Custom-blended NPK fertilizers tailored to specific crop needs and soil conditions.",
    icon: Sprout,
    image: specialtyImage,
    features: ["Crop-Specific", "Balanced Nutrition", "Enhanced Yield"],
  },
];

const Products = () => {
  return (
    <section id="products" className="py-20 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="text-primary">Product Range</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive fertilizer solutions designed for every agricultural need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card 
              key={index}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <product.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">{product.title}</CardTitle>
                <CardDescription className="text-base">{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <span className="w-2 h-2 rounded-full bg-primary mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
