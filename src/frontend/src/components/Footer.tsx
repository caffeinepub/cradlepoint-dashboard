import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4">
        <p className="text-center text-xs text-muted-foreground">
          © 2025. Built with <Heart className="inline h-3 w-3 text-red-500" />{" "}
          using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
