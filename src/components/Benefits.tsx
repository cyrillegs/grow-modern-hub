import { TrendingUp, Shield, Leaf, Award } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const benefits = [
  {
    icon: TrendingUp,
    title: "Increased Yields",
    description: "Boost crop productivity by up to 40% with our scientifically formulated nutrients",
  },
  {
    icon: Shield,
    title: "Soil Protection",
    description: "Maintain and improve soil health for long-term agricultural sustainability",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description: "Environmentally responsible formulas that reduce ecological impact",
  },
  {
    icon: Award,
    title: "Proven Quality",
    description: "Certified products trusted by farmers worldwide for over two decades",
  },
];

const Benefits = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30" ref={ref}>
      <div className="container px-4">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-primary">Our Fertilizers?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the difference that quality nutrition makes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`text-center group hover:scale-105 transition-all duration-300 ${
                isVisible ? 'animate-fade-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mx-auto mb-6 transition-colors duration-300">
                <benefit.icon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
