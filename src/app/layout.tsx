import type { Metadata, Viewport } from "next";
import { InlineScript } from "@/components/inline-script";
import { SplashScreen } from "@/components/splash-screen";
import { INTRO_STORAGE_KEY, SIDEBAR_STORAGE_KEY } from "@/lib/storage-keys";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.initials}` },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: "#ffd60a",
  // Lets the yellow top bar run under the notch; padding uses safe-area insets.
  viewportFit: "cover",
};

// Runs before first paint so returning visitors never see a flash: the intro
// plays once per browser session, and the sidebar keeps its collapsed state.
const beforePaint = [
  `try{if(sessionStorage.getItem(${JSON.stringify(INTRO_STORAGE_KEY)}))document.documentElement.dataset.intro="done"}catch(e){}`,
  `try{if(localStorage.getItem(${JSON.stringify(SIDEBAR_STORAGE_KEY)})==="collapsed")document.documentElement.dataset.sidebar="collapsed"}catch(e){}`,
].join(";");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <InlineScript html={beforePaint} />
      </head>
      <body className="h-full font-sans">
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
