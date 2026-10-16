import type { Metadata, Viewport } from "next";
import { InlineScript } from "@/components/inline-script";
import { SplashScreen } from "@/components/splash-screen";
import { INTRO_STORAGE_KEY } from "@/lib/intro";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.initials}` },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: "#ffd60a",
};

// The intro plays once per browser session. This runs before first paint so
// returning visitors never see a flash of the splash screen.
const skipIntroIfSeen = `try{if(sessionStorage.getItem(${JSON.stringify(
  INTRO_STORAGE_KEY,
)}))document.documentElement.dataset.intro="done"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <InlineScript html={skipIntroIfSeen} />
      </head>
      <body className="h-full font-sans">
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
