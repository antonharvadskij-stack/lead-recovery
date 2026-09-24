import { Link } from "@tanstack/react-router";
import { track } from "@/lib/track";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="text-lg font-semibold tracking-tight text-foreground">
          Lead <span className="text-primary">Recovery</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link
            to="/guides"
            className="hidden text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            Guides
          </Link>
          <Link
            to="/starter-kit"
            onClick={() => track("starter_kit_click")}
            className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Starter Kit
          </Link>
          <Link
            to="/tool-match"
            className="hidden text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Tool Match
          </Link>
          <Link
            to="/"
            hash="audit"
            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
          >
            Free audit
          </Link>
        </nav>
      </div>
    </header>
  );
}