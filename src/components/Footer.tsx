import { cn } from "@/lib/utils";

interface FooterProps {
  collapsed: boolean;
}

export default function Footer({ collapsed }: FooterProps) {
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
          <strong>Copyright &copy; 2024</strong> Admin Portal
        </div>
        <div className="hidden sm:block">
          <b>Version</b> 1.0.0
        </div>
      </div>
    </footer>
  );
}
