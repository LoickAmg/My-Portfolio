"use client";

import Link from "next/link";
import StatusPage from "@/components/StatusPage";
import { useT } from "@/lib/i18n";
import styles from "@/components/StatusPage.module.css";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useT();
  const copy = t.errorPage;

  return (
    <StatusPage code="500" eyebrow={copy.eyebrow} title={copy.title} text={copy.text}>
      <div className={styles.actions}>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => retry()}>
          {copy.retry}
        </button>
        <Link href="/" className={styles.btn}>
          {copy.home}
        </Link>
      </div>
      {error.digest && (
        <p className={styles.reference}>
          {copy.reference} : {error.digest}
        </p>
      )}
    </StatusPage>
  );
}
