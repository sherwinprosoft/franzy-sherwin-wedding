import Background from "@/components/Background";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import WeddingAudio, { WeddingAudioProvider } from "@/components/WeddingAudio";

export default function RsvpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WeddingAudioProvider>
      <WeddingAudio />

      <main className="relative z-0 min-h-screen overflow-hidden bg-transparent selection:bg-gold/20 selection:text-primary">
        <Background />
        <Sidebar solid />
        {children}
        <Footer />
      </main>
    </WeddingAudioProvider>
  );
}
