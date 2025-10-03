import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Leaf, Droplets, Sprout, Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import organicImage from "@/assets/fertilizer-organic.jpg";
import liquidImage from "@/assets/fertilizer-liquid.jpg";
import specialtyImage from "@/assets/fertilizer-specialty.jpg";

const products = [
  {
    title: "Organic Fertilizers",
    description: "Natural, eco-friendly solutions that enrich soil health and promote sustainable farming practices.",
    icon: Leaf,
    image: organicImage,
    features: [
      "100% Natural ingredients",
      "Soil health enrichment",
      "Long-lasting nutrients",
      "Environmentally safe",
      "Improved water retention"
    ],
    specs: {
      npk: "5-3-2",
      application: "Broadcast or band application",
      coverage: "50 lbs per acre"
    },
    price: "Starting at $45/bag"
  },
  {
    title: "Liquid Solutions",
    description: "Fast-acting liquid fertilizers for immediate nutrient delivery and rapid plant response.",
    icon: Droplets,
    image: liquidImage,
    features: [
      "Quick absorption",
      "Precise application",
      "Water soluble",
      "Foliar or soil application",
      "Instant results"
    ],
    specs: {
      npk: "10-5-5",
      application: "Spray or drip irrigation",
      coverage: "1 gallon per 100 sq ft"
    },
    price: "Starting at $35/gallon"
  },
  {
    title: "Specialty Formulas",
    description: "Custom-blended NPK fertilizers tailored to specific crop needs and soil conditions.",
    icon: Sprout,
    image: specialtyImage,
    features: [
      "Crop-specific formulation",
      "Balanced nutrition",
      "Enhanced yield potential",
      "Custom NPK ratios",
      "Professional-grade quality"
    ],
    specs: {
      npk: "15-15-15",
      application: "Customizable",
      coverage: "Varies by formulation"
    },
    price: "Starting at $55/bag"
  },
];

const Products = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleQuoteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    toast({
      title: "Quote Request Sent!",
      description: `We'll contact you soon regarding ${selectedProduct}.`,
    });
    
    setIsDialogOpen(false);
    e.currentTarget.reset();
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <section className="py-20 bg-muted/30" ref={headerRef}>
          <div className="container px-4">
            <div className={`text-center mb-16 transition-all duration-700 ${headerVisible ? 'animate-fade-up' : 'opacity-0'}`}>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Our <span className="text-primary">Products</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Discover our comprehensive range of premium fertilizers designed to maximize crop yields and promote sustainable agriculture
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
                      isVisible ? 'animate-fade-up' : 'opacity-0'
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
                      <CardTitle className="text-2xl">{product.title}</CardTitle>
                      <CardDescription className="text-base">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Key Features:</h4>
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
                          <span className="text-muted-foreground">NPK Ratio:</span>
                          <Badge variant="secondary">{product.specs.npk}</Badge>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Application:</span>
                          <p className="text-foreground mt-1">{product.specs.application}</p>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Coverage:</span>
                          <p className="text-foreground mt-1">{product.specs.coverage}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center border-t pt-6">
                      <span className="text-lg font-bold text-primary">{product.price}</span>
                      <Dialog open={isDialogOpen && selectedProduct === product.title} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (open) setSelectedProduct(product.title);
                      }}>
                        <DialogTrigger asChild>
                          <Button onClick={() => {
                            setSelectedProduct(product.title);
                            setIsDialogOpen(true);
                          }}>
                            Request Quote
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Request Quote - {product.title}</DialogTitle>
                            <DialogDescription>
                              Fill out the form below and we'll get back to you with a custom quote.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleQuoteSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Name *</Label>
                              <Input id="name" name="name" required placeholder="Your full name" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email *</Label>
                              <Input id="email" name="email" type="email" required placeholder="your@email.com" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone</Label>
                              <Input id="phone" name="phone" type="tel" placeholder="Your phone number" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="quantity">Estimated Quantity</Label>
                              <Input id="quantity" name="quantity" placeholder="e.g., 100 bags, 500 gallons" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="message">Additional Details</Label>
                              <Textarea 
                                id="message" 
                                name="message" 
                                placeholder="Tell us about your specific needs..." 
                                className="min-h-[100px]"
                              />
                            </div>
                            <Button type="submit" className="w-full">Submit Quote Request</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
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
