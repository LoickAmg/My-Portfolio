import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <span>© {year} — Mahouna</span>
      <span>Signal in / noise out</span>
    </footer>
  );
}
