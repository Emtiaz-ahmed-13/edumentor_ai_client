import { useEffect } from "react";
import aiService from "../api/ai.service";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import CTA from "./home-sections/CTA";
import FAQ from "./home-sections/FAQ";
import Features from "./home-sections/Features";
import Hero from "./home-sections/Hero";
import HowItWorks from "./home-sections/HowItWorks";
import Pricing from "./home-sections/Pricing";
import Stats from "./home-sections/Stats";
import Testimonials from "./home-sections/Testimonials";

export default function Home() {
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await aiService.checkHealth();
        console.log("Backend Connected :", response.message);
      } catch (error) {
        console.error("Backend Connection Failed:", error);
      }
    };
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      
      <main className="flex-1 w-full pt-16">
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
