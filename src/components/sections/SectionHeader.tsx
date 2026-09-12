import styles from "./sections.module.css";

export default function SectionHeader({
  index,
  label,
}: {
  index: string;
  label: string;
}) {
  return (
    <div className={styles.header}>
      <span className={styles.headerLine} />
      <span>{index}</span>
      <span className={styles.headerLabel}>{label}</span>
    </div>
  );
}
