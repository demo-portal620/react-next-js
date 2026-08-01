import { cn } from "@/lib/utils";
import packageJson from "../../package.json";

interface FooterProps {
  collapsed: boolean;
}

export default function Footer({ collapsed }: FooterProps) {
  // Both sourced from real values instead of hardcoded strings - the old
  // "Version 1.0.0" here was never actually connected to package.json's
  // version (which was 0.1.0), so the two had already drifted apart.
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "main-footer fixed bottom-0 bg-white border-t border-gray-200 py-2 px-4 text-sm text-gray-600 transition-all duration-300",
        collapsed ? "left-16" : "left-64",
        "right-0"
      )}
    >
      <div className="flex justify-between items-center">
        <div>
          <strong>Copyright &copy; {year}</strong> Admin Portal
        </div>
        <div className="hidden sm:block">
          <b>Version</b> {packageJson.version}
        </div>
      </div>
    </footer>
  );
}
