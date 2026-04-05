import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  FileText,
  ArrowRight,
  CheckCircle,
  User,
  Menu,
  X,
  Sparkles,
  Download,
  Layout,
  Shield,
  Zap,
  Star,
  Github,

  Linkedin,
  Mail
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCreateResume = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* LandingHeader */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-foreground">ResuOne</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
              >
                Testimonials
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {/* User features removed */}
              <Button
                onClick={handleCreateResume}
                className="bg-indigo-600 hover:bg-indigo-700 text-white hidden sm:flex transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
              >
                {user ? "Dashboard" : "Get Started"}
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top">
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-left text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-left text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                >
                  How it Works
                </button>
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="text-left text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                >
                  Testimonials
                </button>
                {/* Mobile auth links removed */}
                <Button
                  onClick={handleCreateResume}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                >
                  {user ? "Dashboard" : "Get Started"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-b from-indigo-50/50 dark:from-indigo-950/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground mb-6">
              Your Dream Job Starts With the{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Right Resume.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Create professional, ATS-friendly resumes with our intuitive builder.
              Choose from stunning templates, customize every detail, and export instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={handleCreateResume}
                size="default"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-5 h-auto transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
              >
                {user ? "Go to Dashboard" : "Create Resume"}
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              {/* Sign‑up button removed */}
              <Button
                onClick={() => scrollToSection("features")}
                size="default"
                variant="outline"
                className="px-6 py-5 h-auto border-2 transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-indigo-600 dark:hover:border-indigo-400 active:scale-95"
              >
                View Features
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>ATS-Friendly</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Professional Templates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>AI Suggestions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make resume building effortless and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "ATS-Optimized Templates",
                description: "All templates are designed to pass applicant tracking systems with clean formatting and semantic structure."
              },
              {
                icon: Sparkles,
                title: "AI-Powered Suggestions",
                description: "Get intelligent recommendations to improve your resume content and increase your chances of getting noticed."
              },
              {
                icon: Zap,
                title: "Instant Feedback",
                description: "Receive real-time suggestions and ATS scores as you build your resume to optimize it for success."
              },
              {
                icon: Download,
                title: "Multiple Export Formats",
                description: "Download your resume as PDF or DOCX with all formatting and links preserved perfectly."
              },
              {
                icon: Layout,
                title: "Keyword Optimization",
                description: "Our system helps you identify and include relevant keywords that employers are looking for."
              },
              {
                icon: FileText,
                title: "Cover Letter Builder",
                description: "Create matching cover letters that complement your resume and increase your application success rate."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-muted/50 rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Create Your Resume in 4 Simple Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process makes resume building quick and easy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500" />

            {[
              { step: "1", title: "Create Profile", color: "bg-blue-500", icon: User },
              { step: "2", title: "Choose Template", color: "bg-indigo-500", icon: Layout },
              { step: "3", title: "Customize & Optimize", color: "bg-violet-500", icon: Sparkles },
              { step: "4", title: "Download & Apply", color: "bg-purple-500", icon: Download }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className={`w-24 h-24 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg hover:scale-110 transition-transform relative z-10`}>
                  <item.icon className="w-12 h-12 text-white" />
                </div>
                <div className="text-2xl font-bold text-foreground mb-2">{item.title}</div>
                <p className="text-muted-foreground">
                  {index === 0 && "Sign up and enter your basic information"}
                  {index === 1 && "Select from our professional ATS-friendly templates"}
                  {index === 2 && "Customize content, add sections, and get AI suggestions"}
                  {index === 3 && "Export to PDF or DOCX and start applying"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Loved by Job Seekers Everywhere
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users are saying about their success with ResuOne.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Software Engineer",
                quote: "Landed my dream job at Google thanks to ResuOne! The ATS optimization feature made all the difference.",
                avatar: "SC"
              },
              {
                name: "Michael Rodriguez",
                role: "Marketing Manager",
                quote: "The templates are beautiful and professional. I got 3 interview calls within a week of using my new resume.",
                avatar: "MR"
              },
              {
                name: "Emily Johnson",
                role: "Product Designer",
                quote: "Best resume builder I've used. The AI suggestions helped me highlight my strengths perfectly.",
                avatar: "EJ"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-muted/50 rounded-2xl p-6 border border-border"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about ResuOne.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[
              {
                question: "Is ResuOne really free?",
                answer: "Yes! ResuOne is completely free to use. You can create unlimited resumes, export them in multiple formats, and access all features without any cost."
              },
              {
                question: "Are the resumes ATS-friendly?",
                answer: "Absolutely! All our templates are designed to pass applicant tracking systems. We use clean formatting, semantic structure, and proper keyword placement to ensure your resume gets through."
              },
              {
                question: "Can I download my resume as PDF?",
                answer: "Yes, you can export your resume in both PDF and DOCX formats. All formatting, links, and styling are preserved perfectly in the exported files."
              },
              {
                question: "Do I need to sign up to use ResuOne?",
                answer: "You can start building your resume without signing up, but signing up allows you to save your resumes, access them from anywhere, and create multiple versions."
              },
              {
                question: "How many resumes can I create?",
                answer: "With a free account, you can save up to 5 resumes. You can create and export unlimited resumes, but only 5 can be saved to your account at a time."
              }
            ].map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
                <AccordionTrigger className="text-left text-foreground font-semibold hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-extrabold">ResuOne</span>
              </div>
              <p className="text-slate-400 max-w-md">
                Build professional resumes effortlessly. Free forever with no hidden costs.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => scrollToSection("features")} className="hover:text-white transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("how-it-works")} className="hover:text-white transition-colors">
                    How it Works
                  </button>
                </li>
                <li>
                  <Link to="/resume" className="hover:text-white transition-colors">
                    Build Resume
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Links & Copyright */}
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} ResuOne. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/chetan-palta"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/chetan-palta"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:itzchetan0007@gmail.com"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
