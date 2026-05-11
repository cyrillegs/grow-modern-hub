import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Mail, Phone, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const WHATSAPP_URL = `https://wa.me/639954115063?text=${encodeURIComponent(
  "Hi GreenGrows, I'd like to inquire about your fertilizers.",
)}`;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(50, "Phone number is too long").optional(),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message is too long"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const Contact = () => {
  const { toast } = useToast();
  const { ref, isVisible } = useScrollAnimation();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  const onSubmit = async (values: ContactFormValues) => {
    const { error } = await supabase.from("contacts").insert({
      name: values.name,
      email: values.email,
      phone: values.phone?.trim() ? values.phone.trim() : null,
      message: values.message,
    });

    if (error) {
      toast({
        title: "Failed to send message",
        description: "Something went wrong. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    form.reset();
  };

  return (
    <section id="contact" className="py-20 bg-muted/30" ref={ref}>
      <div className="container px-4">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get In <span className="text-primary">Touch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to transform your agricultural success? Contact us today
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className={`transition-all duration-700 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <h3 className="text-2xl font-bold mb-2">Send Us a Message</h3>
            <p className="text-muted-foreground mb-6">
              We'll get back to you within 1 business day.
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Name"
                          autoComplete="name"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email Address"
                          autoComplete="email"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone <span className="text-sm font-normal text-muted-foreground">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Phone Number"
                          autoComplete="tel"
                          className="h-12"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your Message"
                          className="min-h-[150px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={form.formState.isSubmitting}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300"
                >
                  {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-muted/30 px-3 text-xs uppercase tracking-wider text-muted-foreground">
                  or for a faster reply
                </span>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="w-full bg-[#25D366] hover:bg-[#1FBA56] text-white transition-colors duration-200"
            >
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon className="h-5 w-5 mr-2" />
                Chat on WhatsApp
              </a>
            </Button>
          </div>

          <div className={`space-y-8 transition-all duration-700 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '400ms' }}>
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Email</h4>
                <p className="text-muted-foreground">info@fertilizers.com</p>
                <p className="text-muted-foreground">support@fertilizers.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Phone</h4>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
                <p className="text-muted-foreground">+1 (555) 987-6543</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Office</h4>
                <p className="text-muted-foreground">123 Agriculture Ave</p>
                <p className="text-muted-foreground">Green Valley, CA 94040</p>
              </div>
            </div>

            <div className="bg-card border-2 rounded-xl p-6 mt-8">
              <h4 className="font-semibold mb-2">Business Hours</h4>
              <p className="text-muted-foreground">Monday - Friday: 8:00 AM - 6:00 PM</p>
              <p className="text-muted-foreground">Saturday: 9:00 AM - 4:00 PM</p>
              <p className="text-muted-foreground">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
