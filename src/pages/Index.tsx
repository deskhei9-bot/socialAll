import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, Shield, Globe, Sparkles, Clock, TrendingUp, Smartphone, Database, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] [mask-image:radial-gradient(white,transparent_85%)]" />
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
                <Zap className="w-6 h-6 text-primary" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Social Symphony
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Social Media Management
              <span className="block mt-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              ကိုယ့်ပိုင် server တွင် host လုပ်ထားသော အပြည့်အဝ လုံခြုံမှုရှိသော social media auto-publishing platform
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 group"
                onClick={handleGetStarted}
              >
                စတင်အသုံးပြုမယ်
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => navigate("/status")}
              >
                System Status
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Self-Hosted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">3+</div>
                <div className="text-sm text-muted-foreground">Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">AI</div>
                <div className="text-sm text-muted-foreground">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            အင်္ဂါရပ်များ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Social media management အတွက် လိုအပ်သော အရာအားလုံးကို တစ်နေရာထဲတွင်
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Cards */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Multi-Platform Support</h3>
              <p className="text-muted-foreground">
                Facebook, YouTube, TikTok စသော platform များတွင် တစ်ပြိုင်နက် post တင်နိုင်ပါသည်
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Content</h3>
              <p className="text-muted-foreground">
                AI မှ အလိုအလျောက် caption နှင့် hashtag များ generate လုပ်ပေးပါသည်
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                အချိန်ကြိုတင်သတ်မှတ်ပြီး posts များကို အလိုအလျောက် တင်ပို့နိုင်ပါသည်
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Post များ၏ performance ကို real-time တွင် ခွဲခြမ်းစိတ်ဖြာနိုင်ပါသည်
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">100% Self-Hosted</h3>
              <p className="text-muted-foreground">
                Cloud service အမှီအခိုမရှိဘဲ သင့် server တွင် အပြည့်အဝ ထိန်းချုပ်နိုင်ပါသည်
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Enterprise Security</h3>
              <p className="text-muted-foreground">
                JWT authentication, encryption, နှင့် SSL/TLS ဖြင့် အပြည့်အဝ လုံခြုံပါသည်
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Technology Stack
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              မျက်မှောက်ခေတ် နည်းပညာများဖြင့် တည်ဆောက်ထားပါသည်
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-semibold">Frontend</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• React 18 + TypeScript</li>
                  <li>• Vite Build Tool</li>
                  <li>• Tailwind CSS + shadcn/ui</li>
                  <li>• TanStack Query</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-semibold">Backend</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Node.js 20 + Express</li>
                  <li>• TypeScript</li>
                  <li>• JWT Authentication</li>
                  <li>• PM2 Process Manager</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-semibold">Infrastructure</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• PostgreSQL 16</li>
                  <li>• Nginx Web Server</li>
                  <li>• Let's Encrypt SSL</li>
                  <li>• Cloudflare CDN</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/20">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              သင့် social media content များကို ပိုမို efficient ဖြစ်အောင် စီမံခန့်ခွဲပါ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 group"
                onClick={handleGetStarted}
              >
                Start Free Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => window.open('https://github.com/deskhei9-bot/social-symphony', '_blank')}
              >
                View on GitHub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-semibold">Social Symphony</span>
              <span className="text-muted-foreground">v1.0.0</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="/status" className="hover:text-primary transition-colors">System Status</a>
              <a href="https://github.com/deskhei9-bot/social-symphony" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
              <span>© 2025 Social Symphony</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
