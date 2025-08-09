import styles from "./styles.module.css";

console.log("styles:", styles);

// HTML + CSS

// JSX + CSS

export default function Contact() {
  return (
    <div className={styles.content}>
      <h1>Contact</h1>
      <p>this is p</p>
    </div>
  );
}
