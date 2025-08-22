import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Sparkles, 
  Zap, 
  ShoppingCart, 
  BarChart3, 
  Code2, 
  Mail,
  ArrowRight,
  Star
} from "lucide-react";

const Hero = () => {
  const features = [
    { icon: Sparkles, text: "Free & Premium themes" },
    { icon: Zap, text: "Social embeds (YouTube, Spotify, TikTok)" },
    { icon: ShoppingCart, text: "E-commerce: Sell products & services" },
    { icon: BarChart3, text: "Powerful analytics & insights" },
    { icon: Code2, text: "Developer mode with custom widgets" },
    { icon: Mail, text: "Built-in email opt-in forms" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          {/* Badge */}
          <div className="animate-fade-in">
            <Badge variant="secondary" className="mb-8 px-4 py-2">
              <Star className="w-4 h-4 mr-2 text-primary" />
              Next-generation link-in-bio platform
            </Badge>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up">
            Build your smart{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              link hub
            </span>{" "}
            with Lynx
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            More than just a bio link – grow your brand with customizable pages, 
            powerful analytics, and monetization.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button asChild size="lg" className="text-lg px-8 py-4 shadow-glow">
              <Link href="/auth/register">
                Get Started – It&apos;s Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-card/80 backdrop-blur-sm border border-border/50 hover:shadow-elegant transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{feature.text}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Social proof */}
          <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <p className="text-muted-foreground mb-4">Trusted by creators worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-2xl font-bold">10k+</div>
              <div className="text-2xl font-bold">Users</div>
              <div className="text-2xl font-bold">50k+</div>
              <div className="text-2xl font-bold">Links</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;