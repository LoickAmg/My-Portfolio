"use client";

import { Component, type ReactNode } from "react";
import styles from "./ExperienceBoundary.module.css";

interface ExperienceBoundaryProps {
  message: string;
  retryLabel: string;
  className?: string;
  children: ReactNode;
}

interface ExperienceBoundaryState {
  failed: boolean;
  attempt: number;
}

// Isole une expérience : si elle plante, le reste du site continue de
// fonctionner et la personne peut relancer l'expérience seule.
export default class ExperienceBoundary extends Component<ExperienceBoundaryProps, ExperienceBoundaryState> {
  state: ExperienceBoundaryState = { failed: false, attempt: 0 };

  static getDerivedStateFromError(): Partial<ExperienceBoundaryState> {
    return { failed: true };
  }

  private retry = () => {
    this.setState((previous) => ({ failed: false, attempt: previous.attempt + 1 }));
  };

  render() {
    if (this.state.failed) {
      return (
        <div className={styles.failure} role="alert">
          <p className={styles.message}>{this.props.message}</p>
          <button type="button" className={styles.retry} onClick={this.retry}>
            {this.props.retryLabel}
          </button>
        </div>
      );
    }
    return (
      <div key={this.state.attempt} className={this.props.className}>
        {this.props.children}
      </div>
    );
  }
}
