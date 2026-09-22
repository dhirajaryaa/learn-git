"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border border-[#f97316]/40 bg-[#f97316]/10 p-6" role="alert">
          <p className="text-[15px] font-semibold text-foreground">
            {this.props.label ?? "Something crashed here."}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            The rest of the page is unaffected. You can reset this block and keep going.
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <details className="mt-3 max-h-40 overflow-auto text-[11px] text-muted">
            <summary className="cursor-pointer select-none">Details</summary>
            <pre className="mt-2 whitespace-pre-wrap font-mono">{String(this.state.error?.message ?? this.state.error)}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}