import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EcomStacks Directory | Top Micro-Tools for E-commerce & Solo Brands',
  description: 'Curated directory of high-converting visual, automation, and marketing micro-tools trusted by Shopify, Etsy, and Amazon brand builders to double their revenue.',
  keywords: 'e-commerce directory, Shopify tools, micro-tools, solo brand, 1-person shopify, image optimizer, copywriting automation, ecom stacks',
  metadataBase: new URL('https://portal-main-lilac.vercel.app'), // Portal main Vercel link as base
  openGraph: {
    title: 'EcomStacks Directory Platform',
    description: 'Double your e-commerce revenue with the best curated collection of micro-tools for Shopify, Etsy, and Amazon sellers.',
    type: 'website',
    locale: 'en_US',
    siteName: 'EcomStacks',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EcomStacks Directory Platform',
    description: 'Curated 1-person e-commerce stack to scale storefront conversion rates.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Load Google Material Symbols Outlined stylesheet */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" 
          rel="stylesheet" 
        />
        {/* Load Inter Font families */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased bg-background text-on-background min-h-screen flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
