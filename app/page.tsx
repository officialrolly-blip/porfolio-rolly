import About from "./components/About";
import Contact from "./components/Contact";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import TrainingsCertificates from "./components/TrainingsCertificates";
import Testimonials from "./components/Testimonials";
import VideoIntro from "./components/VideoIntro";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full flex-1 flex-col">
        <Hero />
        <VideoIntro />
        <About />
        <Projects />
        <TrainingsCertificates />
        <Skills />
        <Testimonials />
        <Contact />
      </main>
    </div>
  );
}
