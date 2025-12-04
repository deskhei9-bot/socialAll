import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, Zap, Shield, Globe, Sparkles, Clock, TrendingUp, Lock, 
  Check, Play, Upload, Calendar, BarChart3, Users, Star, 
  Facebook, Youtube, Instagram, Twitter, Linkedin, MessageCircle
} from "lucide-react";
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
        
        <div className="container mx-auto px-4 py-12 sm:py-20 relative">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
                  <img 
                    src="https://raw.githubusercontent.com/deskhei9-bot/socialAll/master/8e616651-fa00-4358-9da7-2c76e7a78c6f.png" 
                    alt="SocialFlow Logo" 
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  SocialFlow
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight">
              Social Media အားလုံးကို
              <span className="block mt-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                တစ်နေရာတည်းမှ စီမံပါ
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-2">
              Facebook, YouTube, TikTok, Instagram, Twitter, LinkedIn တို့ကို တစ်ချက်နှိပ်ရုံဖြင့် 
              အလိုအလျောက် Post တင်နိုင်သော Self-Hosted Platform
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 group"
                onClick={handleGetStarted}
              >
                အခမဲ့ စတင်မည်
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
                <div className="text-3xl font-bold text-primary">8+</div>
                <div className="text-sm text-muted-foreground">Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">AI</div>
                <div className="text-sm text-muted-foreground">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">∞</div>
                <div className="text-sm text-muted-foreground">Unlimited Posts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Platforms Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ပံ့ပိုးထားသော Platform များ
          </h2>
          <p className="text-muted-foreground">
            လူကြိုက်များသော Social Media Platform အားလုံးကို ချိတ်ဆက်နိုင်ပါသည်
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Facebook className="w-8 h-8 text-blue-500" />
            </div>
            <span className="text-sm font-medium">Facebook</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="w-16 h-16 bg-pink-500/10 rounded-xl flex items-center justify-center">
              <Instagram className="w-8 h-8 text-pink-500" />
            </div>
            <span className="text-sm font-medium">Instagram</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center">
              <Youtube className="w-8 h-8 text-red-500" />
            </div>
            <span className="text-sm font-medium">YouTube</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="w-16 h-16 bg-foreground/10 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
            <span className="text-sm font-medium">TikTok</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="w-16 h-16 bg-foreground/10 rounded-xl flex items-center justify-center">
              <Twitter className="w-8 h-8" />
            </div>
            <span className="text-sm font-medium">Twitter/X</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="w-16 h-16 bg-blue-600/10 rounded-xl flex items-center justify-center">
              <Linkedin className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-sm font-medium">LinkedIn</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="w-16 h-16 bg-sky-500/10 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-sky-500" />
            </div>
            <span className="text-sm font-medium">Telegram</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="w-16 h-16 bg-red-600/10 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.94s-.36-.72-.36-1.78c0-1.67.97-2.92 2.17-2.92 1.02 0 1.52.77 1.52 1.7 0 1.03-.66 2.58-1 4.01-.28 1.2.6 2.18 1.78 2.18 2.14 0 3.78-2.25 3.78-5.5 0-2.88-2.07-4.89-5.02-4.89-3.42 0-5.43 2.57-5.43 5.22 0 1.03.4 2.14.9 2.74a.36.36 0 0 1 .08.35l-.33 1.36c-.05.22-.18.27-.42.16-1.56-.73-2.54-3-2.54-4.84 0-3.94 2.87-7.56 8.27-7.56 4.34 0 7.72 3.09 7.72 7.23 0 4.32-2.72 7.79-6.5 7.79-1.27 0-2.46-.66-2.87-1.44l-.78 2.97c-.28 1.09-1.04 2.45-1.55 3.28A12 12 0 1 0 12 0z"/>
              </svg>
            </div>
            <span className="text-sm font-medium">Pinterest</span>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">အလုပ်လုပ်ပုံ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ရိုးရှင်းသော အဆင့် ၄ ဆင့်ဖြင့်
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              မိနစ်ပိုင်းအတွင်း သင့် Social Media များကို စီမံနိုင်ပါပြီ
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
                  <Users className="w-8 h-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold">Account ဖွင့်ပါ</h3>
                <p className="text-muted-foreground">
                  Email နှင့် Password ဖြင့် အခမဲ့ Account ဖွင့်ပါ။ ၃၀ စက္ကန့်သာ ကြာပါသည်။
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
                  <Globe className="w-8 h-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold">Channel ချိတ်ဆက်ပါ</h3>
                <p className="text-muted-foreground">
                  Facebook, YouTube, TikTok စသည့် Platform များကို OAuth ဖြင့် လုံခြုံစွာ ချိတ်ဆက်ပါ။
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
                  <Upload className="w-8 h-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold">Content ဖန်တီးပါ</h3>
                <p className="text-muted-foreground">
                  Photo/Video တင်ပါ၊ AI ဖြင့် Caption ရေးခိုင်းပါ၊ Hashtag အကြံပြုချက်များ ရယူပါ။
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
                  <Calendar className="w-8 h-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                </div>
                <h3 className="text-xl font-semibold">Publish / Schedule</h3>
                <p className="text-muted-foreground">
                  ချက်ချင်း Publish လုပ်ပါ သို့မဟုတ် အချိန်သတ်မှတ်ပြီး Schedule လုပ်ထားပါ။
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            အစွမ်းထက် Features များ
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Social Media Management အတွက် လိုအပ်သမျှ အားလုံးကို တစ်နေရာတည်းမှ ရရှိပါမည်
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Cards */}
          <Card className="border-2 hover:border-primary/50 transition-colors group">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Multi-Platform Publishing</h3>
              <p className="text-muted-foreground">
                Facebook, Instagram, YouTube, TikTok, Twitter, LinkedIn, Telegram, Pinterest တို့သို့ 
                တစ်ချက်နှိပ်ရုံဖြင့် တစ်ပြိုင်နက် Post တင်နိုင်ပါသည်။
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Platform ၈ ခုအထိ ပံ့ပိုး
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Platform အလိုက် Content ပြောင်းလဲနိုင်
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors group">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Content</h3>
              <p className="text-muted-foreground">
                OpenAI GPT နည်းပညာဖြင့် ဆွဲဆောင်မှုရှိသော Caption များနှင့် 
                သင့်လျော်သော Hashtag များကို အလိုအလျောက် ဖန်တီးပေးပါသည်။
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  AI Caption Generator
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Smart Hashtag Suggestions
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors group">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Post များကို ကြိုတင် Schedule လုပ်ထားပြီး သတ်မှတ်ထားသော အချိန်တွင် 
                အလိုအလျောက် Publish ဖြစ်စေပါသည်။
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Calendar View
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Timezone Support
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors group">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Post Performance, Engagement Rate, Reach စသည်တို့ကို 
                Real-time တွင် ခြေရာခံ ကြည့်ရှုနိုင်ပါသည်။
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Real-time Analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Platform အလိုက် Report
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors group">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">100% Self-Hosted</h3>
              <p className="text-muted-foreground">
                သင့် Server ပေါ်တွင် ကိုယ်တိုင် Host လုပ်နိုင်ပြီး 
                Data အားလုံးကို ကိုယ်တိုင် ထိန်းချုပ်နိုင်ပါသည်။
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Cloud Service မလိုအပ်
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Full Data Ownership
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors group">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Enterprise Security</h3>
              <p className="text-muted-foreground">
                JWT Authentication, End-to-End Encryption, SSL/TLS Protection 
                တို့ဖြင့် Bank-level Security ပေးစွမ်းပါသည်။
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  OAuth 2.0 Integration
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Token Auto-Refresh
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ရိုးရှင်းသော စျေးနှုန်း
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Self-Hosted Platform ဖြစ်သောကြောင့် Monthly Fee မရှိပါ။ သင့် Server Cost သာ ကျသင့်ပါသည်။
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl">Free</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Platform ၃ ခုအထိ ချိတ်ဆက်နိုင်</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Post ၅၀ / လ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Basic Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Email Support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6" onClick={handleGetStarted}>
                  အခမဲ့ စတင်မည်
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">လူကြိုက်အများဆုံး</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Platform အကန့်အသတ်မရှိ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Post အကန့်အသတ်မရှိ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>AI Caption Generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Advanced Analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Priority Support</span>
                  </li>
                </ul>
                <Button className="w-full mt-6" onClick={handleGetStarted}>
                  Pro ရယူမည်
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Custom Integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Dedicated Server Setup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>24/7 Phone Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>SLA Guarantee</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6" onClick={() => navigate("/contact.html")}>
                  ဆက်သွယ်မေးမြန်းမည်
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">အသုံးပြုသူများ၏ အမြင်</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ကျွန်ုပ်တို့ကို ယုံကြည်သူများ
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground italic">
                "Platform အားလုံးကို တစ်နေရာတည်းမှ စီမံနိုင်တာ အရမ်းအဆင်ပြေပါတယ်။ 
                အချိန်အများကြီး သက်သာသွားပါတယ်။"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-primary">KZ</span>
                </div>
                <div>
                  <p className="font-semibold">Ko Zaw</p>
                  <p className="text-sm text-muted-foreground">Digital Marketer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground italic">
                "AI Caption Generator က တကယ်ကို အသုံးဝင်ပါတယ်။ 
                Content Creation Time ကို ၅၀% လျှော့ချပေးပါတယ်။"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-primary">MT</span>
                </div>
                <div>
                  <p className="font-semibold">Ma Thiri</p>
                  <p className="text-sm text-muted-foreground">Content Creator</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground italic">
                "Self-hosted ဖြစ်တဲ့အတွက် Data Security အတွက် စိတ်ချရပါတယ်။ 
                Enterprise အတွက် သင့်တော်ပါတယ်။"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-primary">UA</span>
                </div>
                <div>
                  <p className="font-semibold">U Aung</p>
                  <p className="text-sm text-muted-foreground">IT Manager</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              မေးလေ့ရှိသော မေးခွန်းများ
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Self-hosted ဆိုတာ ဘာလဲ?</h3>
                <p className="text-muted-foreground text-sm">
                  Self-hosted ဆိုတာ သင့်ကိုယ်ပိုင် Server ပေါ်မှာ Software ကို Install လုပ်ပြီး 
                  Run တာပါ။ Third-party Cloud Service မလိုအပ်ပဲ Data အားလုံးကို 
                  ကိုယ်တိုင် ထိန်းချုပ်နိုင်ပါတယ်။
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">ဘယ် Platform တွေကို Support လုပ်သလဲ?</h3>
                <p className="text-muted-foreground text-sm">
                  Facebook, Instagram, YouTube, TikTok, Twitter/X, LinkedIn, 
                  Telegram, Pinterest စသည့် Platform ၈ ခုကို ပံ့ပိုးထားပါတယ်။
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">API Key လိုအပ်သလား?</h3>
                <p className="text-muted-foreground text-sm">
                  Platform အများစုအတွက် OAuth ဖြင့် ချိတ်ဆက်နိုင်ပါတယ်။ 
                  AI Feature အတွက်သာ OpenAI API Key လိုအပ်ပါတယ်။
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Technical Support ရနိုင်သလား?</h3>
                <p className="text-muted-foreground text-sm">
                  Email Support အတွက် အခမဲ့ ပေးပါတယ်။ Pro နှင့် Enterprise Plan 
                  အတွက် Priority Support နှင့် Phone Support ရနိုင်ပါတယ်။
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/20">
          <CardContent className="p-6 sm:p-8 md:p-12 text-center space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              ယနေ့ပင် စတင်လိုက်ပါ
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              သင့် Social Media Strategy ကို ကျွန်ုပ်တို့၏ အစွမ်းထက် Self-Hosted Platform ဖြင့် 
              ထိန်းချုပ်လိုက်ပါ။ အခမဲ့ Account ဖွင့်ပြီး စမ်းသုံးကြည့်ပါ။
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 sm:pt-4">
              <Button 
                size="lg" 
                className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 group"
                onClick={handleGetStarted}
              >
                အခမဲ့ စတင်မည်
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
                onClick={() => window.open('/help.html', '_blank')}
              >
                <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                Demo ကြည့်မည်
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          {/* Footer Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/about.html" className="hover:text-primary transition-colors">About Us</a>
                </li>
                <li>
                  <a href="/contact.html" className="hover:text-primary transition-colors">Contact</a>
                </li>
                <li>
                  <a href="https://github.com/deskhei9-bot/socialflow" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/help.html" className="hover:text-primary transition-colors">Help Center</a>
                </li>
                <li>
                  <a href="/faq.html" className="hover:text-primary transition-colors">FAQ</a>
                </li>
                <li>
                  <a href="/status" className="hover:text-primary transition-colors">System Status</a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/privacy-policy.html" className="hover:text-primary transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="/terms-of-service.html" className="hover:text-primary transition-colors">Terms of Service</a>
                </li>
                <li>
                  <a href="/cookie-policy.html" className="hover:text-primary transition-colors">Cookie Policy</a>
                </li>
                <li>
                  <a href="/user-data-deletion.html" className="hover:text-primary transition-colors">Data Deletion</a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/help.html#api" className="hover:text-primary transition-colors">API Documentation</a>
                </li>
                <li>
                  <a href="/help.html#quick-start" className="hover:text-primary transition-colors">Quick Start Guide</a>
                </li>
                <li>
                  <a href="/help.html#troubleshooting" className="hover:text-primary transition-colors">Troubleshooting</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center p-0.5 overflow-hidden">
                <img 
                  src="https://raw.githubusercontent.com/deskhei9-bot/socialAll/master/8e616651-fa00-4358-9da7-2c76e7a78c6f.png" 
                  alt="SocialFlow Logo" 
                  className="w-full h-full object-contain rounded-sm"
                />
              </div>
              <span className="font-semibold">SocialFlow</span>
              <span className="text-muted-foreground">v1.0.0</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 SocialFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
