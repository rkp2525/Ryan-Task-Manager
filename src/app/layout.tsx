import type { Metadata } from "next";
import { ModeProvider } from "@/providers/ModeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Personal and professional task manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <ModeProvider>{children}</ModeProvider>
      </body>
    </html>
  );
}
