import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  ArrowRight, Zap, Shield, Globe, Sparkles, Clock, TrendingUp, Lock, 
  Check, Play, Upload, Calendar, BarChart3, Users, Star, 
  Facebook, Youtube, Instagram, Twitter, Linkedin, MessageCircle, Menu, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { useState, useEffect } from "react";
import DashboardMockup from "@/components/DashboardMockup";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Status", href: "/status" },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Sticky Navigation Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-md border-b shadow-sm' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden shadow-sm">
                <img 
                  src="https://raw.githubusercontent.com/deskhei9-bot/socialAll/master/8e616651-fa00-4358-9da7-2c76e7a78c6f.png" 
                  alt="SocialFlow Logo" 
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                SocialFlow
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </button>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <Button onClick={() => navigate("/dashboard")} className="hover:scale-105 transition-transform">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/auth")} className="hover:bg-muted/50">
                    Sign In
                  </Button>
                  <Button onClick={() => navigate("/auth")} className="hover:scale-105 transition-transform">
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <div className="flex flex-col gap-6 mt-8">
                  {/* Mobile Logo */}
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
                      <img 
                        src="https://raw.githubusercontent.com/deskhei9-bot/socialAll/master/8e616651-fa00-4358-9da7-2c76e7a78c6f.png" 
                        alt="SocialFlow Logo" 
                        className="w-full h-full object-contain rounded-md"
                      />
                    </div>
                    <span className="text-xl font-bold">SocialFlow</span>
                  </div>

                  {/* Mobile Navigation Links */}
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <button
                        key={link.label}
                        onClick={() => scrollToSection(link.href)}
                        className="text-left text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                      >
                        {link.label}
                      </button>
                    ))}
                  </nav>

                  {/* Mobile CTA Buttons */}
                  <div className="flex flex-col gap-3 pt-4 border-t">
                    {user ? (
                      <Button onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }} className="w-full">
                        Dashboard
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }} className="w-full">
                          Sign In
                        </Button>
                        <Button onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }} className="w-full">
                          Get Started
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Hero Section with Dark Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary/90 to-slate-900 py-16 sm:py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full filter blur-3xl opacity-50" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl opacity-40" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Main Heading */}
            <AnimatedSection animation="fade-up" delay={100}>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white">
                Manage All Your Social Media
                <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  From One Place
                </span>
              </h1>
            </AnimatedSection>

            {/* Subheading */}
            <AnimatedSection animation="fade-up" delay={200}>
              <p className="text-lg sm:text-xl md:text-2xl text-slate-200 max-w-2xl mx-auto px-2">
                Auto-publish to Facebook, YouTube, TikTok, Instagram, Twitter, and LinkedIn 
                with a single click. A fully self-hosted, secure platform.
              </p>
            </AnimatedSection>

            {/* CTA Buttons */}
            <AnimatedSection animation="fade-up" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 group hover:scale-105 transition-all duration-300 bg-white text-slate-900 hover:bg-slate-100"
                  onClick={handleGetStarted}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost" 
                  className="text-lg px-8 py-6 hover:scale-105 transition-all duration-300 border-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => navigate("/status")}
                >
                  System Status
                </Button>
              </div>
            </AnimatedSection>

            {/* Stats */}
            <AnimatedSection animation="fade-up" delay={400}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 max-w-3xl mx-auto">
                <div className="text-center hover:scale-110 transition-transform duration-300 cursor-default">
                  <div className="text-3xl font-bold text-cyan-400">100%</div>
                  <div className="text-sm text-slate-300">Self-Hosted</div>
                </div>
                <div className="text-center hover:scale-110 transition-transform duration-300 cursor-default">
                  <div className="text-3xl font-bold text-cyan-400">8+</div>
                  <div className="text-sm text-slate-300">Platforms</div>
                </div>
                <div className="text-center hover:scale-110 transition-transform duration-300 cursor-default">
                  <div className="text-3xl font-bold text-cyan-400">AI</div>
                  <div className="text-sm text-slate-300">Powered</div>
                </div>
                <div className="text-center hover:scale-110 transition-transform duration-300 cursor-default">
                  <div className="text-3xl font-bold text-cyan-400">∞</div>
                  <div className="text-sm text-slate-300">Unlimited Posts</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <AnimatedSection animation="fade-up" delay={500} className="mt-16 px-4">
            <DashboardMockup />
          </AnimatedSection>
        </div>
      </div>

      {/* Supported Platforms Section */}
      <div className="container mx-auto px-4 py-16">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Supported Platforms
            </h2>
            <p className="text-muted-foreground">
              Connect all your favorite social media platforms in one place
            </p>
          </div>
        </AnimatedSection>
        
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-110 cursor-pointer">
            <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Facebook className="w-8 h-8 text-blue-500" />
            </div>
              <span className="text-sm font-medium">Facebook</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-110 cursor-pointer">
              <div className="w-16 h-16 bg-pink-500/10 rounded-xl flex items-center justify-center">
                <Instagram className="w-8 h-8 text-pink-500" />
              </div>
              <span className="text-sm font-medium">Instagram</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-110 cursor-pointer">
              <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center">
                <Youtube className="w-8 h-8 text-red-500" />
              </div>
              <span className="text-sm font-medium">YouTube</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-110 cursor-pointer">
              <div className="w-16 h-16 bg-foreground/10 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </div>
              <span className="text-sm font-medium">TikTok</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-110 cursor-pointer">
              <div className="w-16 h-16 bg-foreground/10 rounded-xl flex items-center justify-center">
                <Twitter className="w-8 h-8" />
              </div>
              <span className="text-sm font-medium">Twitter/X</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-110 cursor-pointer">
              <div className="w-16 h-16 bg-blue-600/10 rounded-xl flex items-center justify-center">
                <Linkedin className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-sm font-medium">LinkedIn</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-110 cursor-pointer">
              <div className="w-16 h-16 bg-sky-500/10 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-sky-500" />
              </div>
              <span className="text-sm font-medium">Telegram</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted/50 transition-all duration-300 hover:scale-110 cursor-pointer">
              <div className="w-16 h-16 bg-red-600/10 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.94s-.36-.72-.36-1.78c0-1.67.97-2.92 2.17-2.92 1.02 0 1.52.77 1.52 1.7 0 1.03-.66 2.58-1 4.01-.28 1.2.6 2.18 1.78 2.18 2.14 0 3.78-2.25 3.78-5.5 0-2.88-2.07-4.89-5.02-4.89-3.42 0-5.43 2.57-5.43 5.22 0 1.03.4 2.14.9 2.74a.36.36 0 0 1 .08.35l-.33 1.36c-.05.22-.18.27-.42.16-1.56-.73-2.54-3-2.54-4.84 0-3.94 2.87-7.56 8.27-7.56 4.34 0 7.72 3.09 7.72 7.23 0 4.32-2.72 7.79-6.5 7.79-1.27 0-2.46-.66-2.87-1.44l-.78 2.97c-.28 1.09-1.04 2.45-1.55 3.28A12 12 0 1 0 12 0z"/>
                </svg>
              </div>
              <span className="text-sm font-medium">Pinterest</span>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* How It Works Section */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">How It Works</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Get Started in 4 Simple Steps
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Start managing your social media in minutes
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedSection animation="fade-up" delay={0}>
              <div className="relative group">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                  <Users className="w-8 h-8 text-primary" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-semibold">Create Account</h3>
                  <p className="text-muted-foreground">
                    Sign up for free with your email and password. Takes only 30 seconds.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={100}>
              <div className="relative group">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                    <Globe className="w-8 h-8 text-primary" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-semibold">Connect Channels</h3>
                  <p className="text-muted-foreground">
                    Securely connect Facebook, YouTube, TikTok and more via OAuth authentication.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200}>
              <div className="relative group">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                    <Upload className="w-8 h-8 text-primary" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-semibold">Create Content</h3>
                  <p className="text-muted-foreground">
                    Upload photos/videos, generate AI captions, and get smart hashtag suggestions.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={300}>
              <div className="relative group">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
                    <Calendar className="w-8 h-8 text-primary" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  </div>
                  <h3 className="text-xl font-semibold">Publish or Schedule</h3>
                  <p className="text-muted-foreground">
                    Publish instantly or schedule for later at your optimal posting times.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-20 scroll-mt-20">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your social media presence in one place
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Cards */}
          <AnimatedSection animation="fade-up" delay={0}>
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Multi-Platform Publishing</h3>
              <p className="text-muted-foreground">
                Publish to Facebook, Instagram, YouTube, TikTok, Twitter, LinkedIn, Telegram, 
                and Pinterest simultaneously with a single click.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Support for 8+ platforms
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Customize content per platform
                </li>
                </ul>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={100}>
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered Content</h3>
              <p className="text-muted-foreground">
                Generate engaging captions and relevant hashtags automatically 
                using advanced OpenAI GPT technology.
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
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                Schedule posts in advance and let them publish automatically 
                at your specified optimal times.
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
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={300}>
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Track post performance, engagement rates, and reach 
                with real-time analytics and insights.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Real-time Analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Per-platform Reports
                </li>
                </ul>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={400}>
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">100% Self-Hosted</h3>
              <p className="text-muted-foreground">
                Host on your own server with complete control over your data. 
                No dependency on third-party cloud services.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  No Cloud Service Required
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Full Data Ownership
                </li>
                </ul>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={500}>
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Enterprise Security</h3>
              <p className="text-muted-foreground">
                Bank-level security with JWT authentication, end-to-end encryption, 
                and SSL/TLS protection.
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
          </AnimatedSection>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-muted/30 py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">Pricing</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                As a self-hosted platform, you only pay for your server costs. No hidden fees.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <AnimatedSection animation="fade-up" delay={0}>
              <Card className="border-2 relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
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
                      <span>Connect up to 3 platforms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>50 posts per month</span>
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
                  <Button variant="outline" className="w-full mt-6 hover:scale-105 transition-transform" onClick={handleGetStarted}>
                    Get Started Free
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Pro Plan */}
            <AnimatedSection animation="fade-up" delay={100}>
              <Card className="border-2 border-primary relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary animate-pulse">Most Popular</Badge>
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
                      <span>Unlimited platforms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>Unlimited posts</span>
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
                  <Button className="w-full mt-6 hover:scale-105 transition-transform" onClick={handleGetStarted}>
                    Get Pro
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Enterprise Plan */}
            <AnimatedSection animation="fade-up" delay={200}>
              <Card className="border-2 relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
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
                  <Button variant="outline" className="w-full mt-6 hover:scale-105 transition-transform" onClick={() => navigate("/contact.html")}>
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-20">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Users Worldwide
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8">
          <AnimatedSection animation="fade-up" delay={0}>
            <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "Managing all platforms from one place is incredibly convenient. 
                  It has saved me so much time every day."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">JD</span>
                  </div>
                  <div>
                    <p className="font-semibold">John Davis</p>
                    <p className="text-sm text-muted-foreground">Digital Marketer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={100}>
            <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "The AI Caption Generator is incredibly useful. 
                  It has reduced my content creation time by 50%."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">SM</span>
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Miller</p>
                    <p className="text-sm text-muted-foreground">Content Creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "Being self-hosted gives me peace of mind about data security. 
                  Perfect for enterprise requirements."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary">MJ</span>
                  </div>
                  <div>
                    <p className="font-semibold">Michael Johnson</p>
                    <p className="text-sm text-muted-foreground">IT Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="bg-muted/30 py-20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">FAQ</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedSection animation="fade-up" delay={0}>
              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">What does self-hosted mean?</h3>
                  <p className="text-muted-foreground text-sm">
                    Self-hosted means you install and run the software on your own server. 
                    You have complete control over your data without relying on third-party 
                    cloud services.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={100}>
              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Which platforms are supported?</h3>
                  <p className="text-muted-foreground text-sm">
                    We support 8 major platforms: Facebook, Instagram, YouTube, TikTok, 
                    Twitter/X, LinkedIn, Telegram, and Pinterest.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200}>
              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Do I need API keys?</h3>
                  <p className="text-muted-foreground text-sm">
                    Most platforms connect via OAuth authentication. You only need an 
                    OpenAI API key if you want to use the AI caption generation features.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={300}>
              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Is technical support available?</h3>
                  <p className="text-muted-foreground text-sm">
                    Free email support is available for all users. Pro and Enterprise 
                    plans include priority support and phone support options.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <AnimatedSection animation="scale">
          <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/20 hover:shadow-xl transition-all duration-500">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Get Started Today
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Take control of your social media strategy with our powerful self-hosted platform. 
                Create a free account and start exploring.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 sm:pt-4">
                <Button 
                  size="lg" 
                  className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 group hover:scale-105 transition-all duration-300"
                  onClick={handleGetStarted}
                >
                  Start Free Now
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 hover:scale-105 transition-all duration-300"
                  onClick={() => window.open('/help.html', '_blank')}
                >
                  <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Watch Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
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
