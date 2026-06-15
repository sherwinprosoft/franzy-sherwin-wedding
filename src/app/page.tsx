import Hero from "@/components/Hero";
import Story from "@/components/Story";
import Details from "@/components/Details";
import Entourage from "@/components/Entourage";
import GuestNotes from "@/components/GuestNotes";
import Sidebar from "@/components/Sidebar";
import Background from "@/components/Background";
import Footer from "@/components/Footer";
import WeddingAudio from "@/components/WeddingAudio";

export default function Home() {
  return (
    <main className="relative z-0 min-h-screen overflow-hidden bg-transparent selection:bg-gold/20 selection:text-primary">
      <Background />
      <Sidebar />
      <WeddingAudio />

      <Hero />
      <Details />
      <GuestNotes />
      <Entourage />
      <Story />
      <Footer />
    </main>
  );
}
