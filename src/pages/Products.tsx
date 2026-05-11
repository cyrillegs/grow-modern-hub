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
import { Leaf, Droplets, Sprout, Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RequestQuoteDialog } from "@/components/RequestQuoteDialog";
import organicImage from "@/assets/fertilizer-organic.jpg";
import liquidImage from "@/assets/fertilizer-liquid.jpg";
import specialtyImage from "@/assets/fertilizer-specialty.jpg";

const products = [
  {
    title: "NPK 20-20-20",
    description:
      "Balanced all-purpose fertilizer ideal for general crop nutrition and greenhouse applications.",
    icon: Sprout,
    image: specialtyImage,
    features: [
      "Equal NPK ratio for balanced growth",
      "Water soluble formula",
      "Suitable for all crops",
      "Quick nutrient release",
      "Versatile application methods",
    ],
    specs: {
      npk: "20-20-20",
      application: "Foliar spray or fertigation",
      coverage: "25 lbs per acre",
    },
    price: "$42/bag (25kg)",
  },
  {
    title: "Urea (46-0-0)",
    description:
      "High nitrogen fertilizer for rapid vegetative growth and greening of crops.",
    icon: Leaf,
    image: organicImage,
    features: [
      "46% nitrogen content",
      "Cost-effective solution",
      "Fast-acting nitrogen source",
      "Increases protein content",
      "Promotes leafy growth",
    ],
    specs: {
      npk: "46-0-0",
      application: "Broadcast or top dressing",
      coverage: "40 lbs per acre",
    },
    price: "$28/bag (50kg)",
  },
  {
    title: "DAP (18-46-0)",
    description:
      "Diammonium Phosphate for strong root development and early plant establishment.",
    icon: Sprout,
    image: specialtyImage,
    features: [
      "High phosphorus content",
      "Excellent for root growth",
      "Ideal for planting season",
      "Improves seedling vigor",
      "Long-lasting phosphate source",
    ],
    specs: {
      npk: "18-46-0",
      application: "Band or broadcast at planting",
      coverage: "35 lbs per acre",
    },
    price: "$38/bag (50kg)",
  },
  {
    title: "Muriate of Potash (0-0-60)",
    description:
      "Premium potassium fertilizer for fruit development and disease resistance.",
    icon: Droplets,
    image: liquidImage,
    features: [
      "60% potassium content",
      "Enhances fruit quality",
      "Improves stress tolerance",
      "Increases crop yield",
      "Boosts disease resistance",
    ],
    specs: {
      npk: "0-0-60",
      application: "Broadcast or side dressing",
      coverage: "30 lbs per acre",
    },
    price: "$32/bag (50kg)",
  },
  {
    title: "Organic Compost Blend",
    description:
      "100% natural organic fertilizer enriched with beneficial microorganisms.",
    icon: Leaf,
    image: organicImage,
    features: [
      "100% Natural ingredients",
      "Improves soil structure",
      "Rich in organic matter",
      "Slow-release nutrients",
      "Environmentally safe",
    ],
    specs: {
      npk: "5-3-2",
      application: "Broadcast or incorporation",
      coverage: "2 tons per acre",
    },
    price: "$25/bag (40kg)",
  },
  {
    title: "NPK 15-15-15",
    description:
      "Complete balanced fertilizer for all-season crop nutrition and maintenance.",
    icon: Sprout,
    image: specialtyImage,
    features: [
      "Balanced nutrition profile",
      "Suitable for most crops",
      "Consistent nutrient release",
      "Easy to apply",
      "All-purpose formula",
    ],
    specs: {
      npk: "15-15-15",
      application: "Broadcast or banding",
      coverage: "40 lbs per acre",
    },
    price: "$35/bag (50kg)",
  },
  {
    title: "Liquid NPK 10-5-5",
    description:
      "Fast-acting liquid fertilizer for immediate nutrient uptake and quick results.",
    icon: Droplets,
    image: liquidImage,
    features: [
      "Instant absorption",
      "Perfect for foliar feeding",
      "Water soluble concentrate",
      "Precise dosing control",
      "Rapid green-up effect",
    ],
    specs: {
      npk: "10-5-5",
      application: "Foliar spray or drip irrigation",
      coverage: "1 liter per 200 sq ft",
    },
    price: "$45/gallon (5L)",
  },
  {
    title: "Calcium Nitrate",
    description:
      "Premium calcium and nitrogen source for preventing blossom end rot and calcium deficiency.",
    icon: Leaf,
    image: organicImage,
    features: [
      "Dual calcium-nitrogen source",
      "Prevents calcium deficiency",
      "Water soluble",
      "Improves fruit firmness",
      "Reduces plant stress",
    ],
    specs: {
      npk: "15.5-0-0 + 19% Ca",
      application: "Fertigation or foliar spray",
      coverage: "20 lbs per acre",
    },
    price: "$48/bag (25kg)",
  },
  {
    title: "Micronutrient Mix",
    description:
      "Complete micronutrient blend containing zinc, iron, manganese, and boron.",
    icon: Sprout,
    image: specialtyImage,
    features: [
      "Essential trace elements",
      "Prevents micronutrient deficiency",
      "Chelated for better absorption",
      "Improves crop quality",
      "Compatible with most fertilizers",
    ],
    specs: {
      npk: "Zn, Fe, Mn, B, Cu, Mo",
      application: "Foliar or soil application",
      coverage: "5 lbs per acre",
    },
    price: "$65/bag (10kg)",
  },
];

const Products = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <section className="py-20 bg-muted/30" ref={headerRef}>
          <div className="container px-4">
            <div
              className={`text-center mb-16 transition-all duration-700 ${
                headerVisible || window.innerWidth < 768
                  ? "animate-fade-up"
                  : "opacity-0"
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

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {products.map((product, index) => {
                const { ref, isVisible } = useScrollAnimation();
                return (
                  <Card
                    key={index}
                    ref={ref}
                    className={`overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 ${
                      isVisible ? "animate-fade-up" : "opacity-0"
                    }`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="h-56 overflow-hidden">
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
                      <CardTitle className="text-2xl">
                        {product.title}
                      </CardTitle>
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
                          {product.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm">
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
                          <Badge variant="secondary">{product.specs.npk}</Badge>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Application:
                          </span>
                          <p className="text-foreground mt-1">
                            {product.specs.application}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Coverage:
                          </span>
                          <p className="text-foreground mt-1">
                            {product.specs.coverage}
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
                        product={product.title}
                        trigger={
                          <Button className="w-full">Request Quote</Button>
                        }
                      />
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
