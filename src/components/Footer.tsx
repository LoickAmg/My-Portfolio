import Link from "next/link";
import { LEGAL_PAGES } from "@/lib/site";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <span>© {year} — Mahouna</span>
      <nav className={styles.legal} aria-label="Pages légales">
        {LEGAL_PAGES.map((page) => (
          <Link key={page.href} href={page.href} className={styles.legalLink}>
            {page.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
