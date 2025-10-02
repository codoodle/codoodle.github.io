import "./globals.css";

import QueryProvider from "@/components/query-provider";
import SiteBody from "@/components/site-body";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { IBM_Plex_Sans_KR, Major_Mono_Display } from "next/font/google";

export const metadata = {
  title: "코두들",
};

const ibmPlexSansKr = IBM_Plex_Sans_KR({
  subsets: ["latin", "latin-ext"],
  variable: "--font-ibm-plex-sans-kr",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

const majorMonoDisplay = Major_Mono_Display({
  subsets: ["latin"],
  variable: "--font-major-mono-display",
  weight: ["400"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${ibmPlexSansKr.variable} ${majorMonoDisplay.variable}`}
      suppressHydrationWarning
    >
      <body>
        <SiteHeader className="row-[1/2] lg:col-[2/3]" />
        <div className="min-h-dvh grid justify-center grid-cols-1 grid-rows-[auto_auto_1fr] lg:grid-cols-[2.5rem_minmax(0,var(--breakpoint-xl))_2.5rem]">
          <div
            className="hidden border-r border-separator col-[1/2] row-[1/4] lg:block"
            aria-hidden="true"
          ></div>
          <div
            className="hidden border-l border-separator col-[3/4] row-[1/4] lg:block"
            aria-hidden="true"
          ></div>
          <SiteBody className="row-[2/3] lg:col-[2/3]">
            <QueryProvider>{children}</QueryProvider>
          </SiteBody>
          <SiteFooter className="row-[3/4] lg:col-[2/3]" />
        </div>
      </body>
    </html>
  );
}
