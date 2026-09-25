import type { Metadata } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { CustomCursor } from "@/components/ui/custom-cursor";
import "./globals.css";

const display = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const body = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "NSS LICET — Not Me But You", template: "%s · NSS LICET" },
  description:
    "National Service Scheme unit of Loyola-ICAM College of Engineering and Technology — events, volunteers, batch leaderboards and the student portal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
