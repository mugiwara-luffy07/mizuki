import { ExternalLink } from 'lucide-react';

export function DigitekEraFooter() {
  return (
    <a
      href="https://digitekera.com"
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-center gap-2 py-6 px-4 border-t border-border/30 bg-gradient-to-b from-transparent via-muted/20 to-muted/10 text-muted-foreground text-xs hover:text-foreground transition-all duration-300 cursor-pointer"
    >
      {/* Logo Circle with DE initials */}
      <div className="flex items-center justify-center relative">
        <div className="w-5 h-5 rounded-full border border-current/30 group-hover:border-current/60 flex items-center justify-center transition-all duration-300">
          <span className="text-[10px] font-semibold">DE</span>
        </div>
        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 w-5 h-5 rounded-full bg-current/5 group-hover:bg-current/10 blur-sm transition-all duration-300" />
      </div>

      {/* Text */}
      <span className="font-medium">Powered by DigitekEra</span>

      {/* External link icon - hidden by default, shown on hover */}
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </a>
  );
}
