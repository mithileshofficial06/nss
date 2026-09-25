import type { Metadata } from "next";
import { Inter, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { CustomCursor } from "@/components/ui/custom-cursor";
import "./globals.css";

const display = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const body = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "NSS LICET — Not Me But You", template: "%s · NSS LICET" },
  description:
    "National Service Scheme unit of Loyola-ICAM College of Engineering and Technology — events, volunteers, batch leaderboards and the student portal.",
  icons: { icon: "/brand/nss-logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
