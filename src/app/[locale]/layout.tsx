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
    icon: [{ url: "/icon.ico", type: "image/x-icon", sizes: "any" }],
    shortcut: ["/icon.ico"],
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
