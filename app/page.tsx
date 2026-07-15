import Hero from "@/components/Hero";
import ServicesGrid from "@/components/ServicesGrid";
import Stats from "@/components/Stats";
import WhyUs from "@/components/WhyUs";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <ServicesGrid />
      <WhyUs />
      <FAQ />
    </>
  );
}
