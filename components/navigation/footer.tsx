import Link from "next/link";
import { PenTool, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:justify-between md:space-x-12 space-y-8 md:space-y-0">
          {/* Branding */}
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <PenTool className="h-4 w-4" />
              </div>
              <span className="text-xl font-black">BlogCraft</span>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">
              A modern blog platform built for writers who want to focus on
              creating amazing content.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/editor"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Write
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Connect</h3>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/FluffyBrudy"
                target="_blank"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              {/* You can add more icons here like Twitter, Mail, etc. */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
