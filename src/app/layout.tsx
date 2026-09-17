import "./globals.css";
import PageViewTracker from "@/components/PageViewTracker";
import { Toaster } from "@/components/ui/toaster";
import I18nProvider from "@/components/I18nProvider";
import { AuthProvider } from "@/context/AuthContext";
import { BackendStatusProvider } from "@/context/BackendStatusContext";
import BackendStatusOverlay from "@/components/BackendStatusOverlay";

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
        <I18nProvider>
          <BackendStatusProvider>
            <AuthProvider>
              <PageViewTracker />
              {children}
              <Toaster />
              <BackendStatusOverlay />
            </AuthProvider>
          </BackendStatusProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
