import type { Metadata } from "next";
import { Anton, Archivo_Narrow, Inter, Instrument_Serif } from "next/font/google";
import { CustomCursor } from "@/components/ui/custom-cursor";
import "./globals.css";

const display = Archivo_Narrow({ variable: "--font-archivo-narrow", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const body = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poster = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: { default: "NSS LICET — Not Me But You", template: "%s · NSS LICET" },
  description:
    "National Service Scheme unit of Loyola-ICAM College of Engineering and Technology — events, volunteers, batch leaderboards and the student portal.",
  icons: { icon: "/brand/nss-logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${body.variable} ${poster.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
