import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { locales, type Locale } from "@/i18n";
import Header from "@/components/site/header/Header";
import Footer from "@/components/site/footer/Footer";
import Providers from "@/components/Providers";
// import CookieBanner from "@/components/site/CookieBanner";

import { Cambo } from "next/font/google";
import CookieNotice from "@/components/site/cookieNotice/CookieNotice";
import type { Metadata } from "next";

const cambo = Cambo({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "PKT Swiss Kart Team",
  description: "Sito ufficiale del team di karting PKT",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} className={cambo.variable}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Header />
            <CookieNotice />
            {children}
            <Footer />
            {/* <CookieBanner /> */}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
