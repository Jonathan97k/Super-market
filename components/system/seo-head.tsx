import Head from 'next/head'
import { generateStructuredData } from '@/lib/seo'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: string
  structuredData?: {
    type: string
    data: any
  }
}

export default function SEOHead({
  title,
  description,
  keywords,
  image = '/images/og-image.jpg',
  url,
  type = 'website',
  structuredData
}: SEOHeadProps) {
  const siteTitle = title ? `${title} | Supermarket` : 'Supermarket - Fresh Groceries Delivered'
  const siteDescription = description || 'Order fresh groceries, vegetables, fruits, and more from your local supermarket. Fast delivery to your doorstep.'
  const siteUrl = url || process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'
  const siteKeywords = keywords?.join(', ') || 'supermarket, groceries, fresh food, delivery, online shopping'

  const structuredJsonLD = structuredData 
    ? generateStructuredData(structuredData.type, structuredData.data)
    : null

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Supermarket" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={siteUrl} />
      
      {/* Additional meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Structured Data */}
      {structuredJsonLD && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredJsonLD)
          }}
        />
      )}
    </Head>
  )
}
