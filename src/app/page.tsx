import RailNav from "@/components/RailNav";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Method from "@/components/sections/Method";
import Skills from "@/components/sections/Skills";
import Signal from "@/components/sections/Signal";
import Contact from "@/components/sections/Contact";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <RailNav />
      <main className={styles.main}>
        <Hero />
        <Projects />
        <Method />
        <Skills />
        <Signal />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
