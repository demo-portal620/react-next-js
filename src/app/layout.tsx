import "./globals.css";
import PageViewTracker from "@/components/PageViewTracker";

export const metadata = {
  title: "My Admin Portal",
  description: "Sample for presentation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
