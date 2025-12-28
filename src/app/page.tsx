import Bgpattern from "@/components/landing/Bgpattern";
import Navbar from "@/components/landing/Navbar"; 
import Hero from "@/components/landing/Hero";
import Categories from "@/components/landing/Categories";
import HowItWorks from "@/components/landing/HowItWorks";
import Stats from "@/components/landing/Stats";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";


export default function Home() {
  return (
  <>
   <Bgpattern/>
   <Navbar/>
   <Hero/>
   <Categories/>
   <HowItWorks/>
   <Stats/>
   <CTA/>
   <Footer/>
  </>
  );
}
