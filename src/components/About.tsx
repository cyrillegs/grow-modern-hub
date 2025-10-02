import { Users, Target, Zap } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const About = () => {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <section className="py-20" ref={ref}>
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              About <span className="text-primary">Our Company</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Leading the agricultural industry with innovation and excellence
            </p>
          </div>

          <div className={`bg-card border-2 rounded-2xl p-8 md:p-12 mb-12 transition-all duration-700 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              For over 20 years, we've been at the forefront of agricultural innovation, 
              developing premium fertilizer solutions that help farmers achieve exceptional 
              results. Our commitment to quality, sustainability, and customer success has 
              made us a trusted partner for agricultural operations of all sizes.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We combine cutting-edge agricultural science with environmentally responsible 
              practices to create products that not only boost yields but also protect and 
              enrich the soil for future generations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Users, value: '50,000+', label: 'Satisfied Farmers' },
            { icon: Target, value: '98%', label: 'Success Rate' },
            { icon: Zap, value: '20+', label: 'Years Experience' }
          ].map((stat, index) => (
            <div 
              key={index}
              className={`text-center p-6 bg-muted/50 rounded-xl transition-all duration-700 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
              style={{ animationDelay: `${400 + index * 150}ms` }}
            >
              <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
