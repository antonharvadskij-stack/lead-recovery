import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <p className="text-base font-semibold text-foreground">
              Lead <span className="text-primary">Recovery</span>
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Practical lead-response automation for local service businesses.
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link to="/guides" className="transition-colors hover:text-foreground">
              Guides
            </Link>
            <Link to="/" hash="audit" className="transition-colors hover:text-foreground">
              Free audit
            </Link>
            <Link to="/starter-kit" className="transition-colors hover:text-foreground">
              Starter Kit
            </Link>
            <Link to="/tool-match" className="transition-colors hover:text-foreground">
              Tool Match
            </Link>
          </nav>
        </div>

        <div className="mt-10 space-y-3 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
          <p>
            Affiliate disclosure: Some links on this site may be affiliate links. If you purchase
            through one, we may receive a commission at no additional cost to you.
          </p>
          <p>
            Lead Recovery is an independent project and is not affiliated with HighLevel or any other
            software vendor unless explicitly stated.
          </p>
          <p>Lead Recovery does not provide technical diagnosis or licensed trade advice.</p>
        </div>
      </div>
    </footer>
  );
}