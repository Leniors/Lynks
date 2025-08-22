import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain,
  Calendar,
  CreditCard,
  Globe,
  Code2,
  Download,
  Smartphone,
  Users
} from "lucide-react";

const Features = () => {
  const uniqueFeatures = [
    {
      icon: Brain,
      title: "AI Link Assistant",
      description: "Get smart suggestions for trending or missing links based on your niche (creator, dev, freelancer)",
      badge: "AI-Powered"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Set links to auto-enable/disable based on time, date, or special events",
      badge: "Automation"
    },
    {
      icon: CreditCard,
      title: "Content Monetization",
      description: "Enable tipping (M-Pesa, Stripe), sell digital goods or services directly from your profile",
      badge: "Commerce"
    },
    {
      icon: Globe,
      title: "Custom Domains",
      description: "Premium users can connect their own domain (e.g., yourname.me)",
      badge: "Pro Feature"
    },
    {
      icon: Code2,
      title: "Developer Mode",
      description: "Inject custom HTML/CSS/JS per block, or embed code from GitHub Gists, CodeSandbox",
      badge: "Advanced"
    },
    {
      icon: Download,
      title: "Analytics Export",
      description: "Download your analytics as CSV, share analytics links for brands/sponsors",
      badge: "Business"
    },
    {
      icon: Smartphone,
      title: "Mobile App",
      description: "PWA for managing links, analytics, and notifications on the go",
      badge: "Mobile"
    },
    {
      icon: Users,
      title: "Team Accounts",
      description: "Invite collaborators to help manage your Lynx profile",
      badge: "Collaboration"
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Unique Features That Set Us Apart
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Go beyond basic link-in-bio with advanced features designed for modern creators and businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {uniqueFeatures.map((feature, index) => (
            <Card key={index} className="group hover:shadow-elegant transition-all duration-300 hover:scale-105 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;