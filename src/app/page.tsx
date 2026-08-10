import Hero from "@/components/Hero";
import Details from "@/components/Details";
import Entourage from "@/components/Entourage";
import GuestNotes from "@/components/GuestNotes";
import Sidebar from "@/components/Sidebar";
import Background from "@/components/Background";
import Footer from "@/components/Footer";
import WeddingAudio, { WeddingAudioProvider } from "@/components/WeddingAudio";
import PhotoGallery from "@/components/PhotoGallery";

export default function Home() {
  return (
    <WeddingAudioProvider>
      <WeddingAudio />

      <main className="relative z-0 min-h-screen overflow-hidden bg-transparent selection:bg-gold/20 selection:text-primary">
        <Background />
        <Sidebar />

        <Hero />
        <Details />
        <GuestNotes />
        <Entourage />
        <PhotoGallery />
        <Footer />
      </main>
    </WeddingAudioProvider>
  );
}
