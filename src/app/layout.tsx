import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"CaseCraft — adaptive case interview training",description:"Evidence-led deliberate practice for consulting interviews."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
