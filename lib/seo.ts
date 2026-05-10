import { Metadata } from 'next'

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  openGraph?: {
    title?: string
    description?: string
    images?: string[]
    type?: string
    locale?: string
    siteName?: string
  }
  twitter?: {
    card?: 'summary' | 'summary_large_image'
    title?: string
    description?: string
    images?: string[]
  }
  canonical?: string
  noIndex?: boolean
  alternates?: {
    canonical?: string
    languages?: Record<string, string>
  }
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    openGraph,
    twitter,
    canonical,
    noIndex,
    alternates
  } = config

  const metadata: Metadata = {
    title: title || 'Supermarket - Fresh Groceries Delivered',
    description: description || 'Order fresh groceries, vegetables, fruits, and more from your local supermarket. Fast delivery to your doorstep.',
    keywords: keywords?.join(', ') || 'supermarket, groceries, fresh food, delivery, online shopping',
    openGraph: {
      title: openGraph?.title || title || 'Supermarket - Fresh Groceries Delivered',
      description: openGraph?.description || description || 'Order fresh groceries, vegetables, fruits, and more from your local supermarket.',
      images: openGraph?.images || ['/images/og-image.jpg'],
      type: openGraph?.type || 'website',
      locale: openGraph?.locale || 'en_US',
      siteName: openGraph?.siteName || 'Supermarket',
    },
    twitter: {
      card: twitter?.card || 'summary_large_image',
      title: twitter?.title || title || 'Supermarket - Fresh Groceries Delivered',
      description: twitter?.description || description || 'Order fresh groceries, vegetables, fruits, and more from your local supermarket.',
      images: twitter?.images || ['/images/twitter-image.jpg'],
    },
    alternates: {
      canonical: alternates?.canonical || canonical,
      languages: alternates?.languages,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
  }

  return metadata
}

export function generateProductSEO(product: {
  name: string
  description: string
  price: number
  image: string
  category: string
  inStock: boolean
}): SEOConfig {
  return {
    title: `${product.name} - Fresh from Local Supermarket`,
    description: product.description || `Buy ${product.name} from our supermarket. Fresh quality guaranteed.`,
    keywords: [product.name, product.category, 'supermarket', 'groceries', 'fresh food'],
    openGraph: {
      title: `${product.name} - $${product.price}`,
      description: product.description || `Fresh ${product.name} available at your local supermarket`,
      images: [product.image],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - $${product.price}`,
      description: product.description || `Fresh ${product.name} available at your local supermarket`,
      images: [product.image],
    },
  }
}

export function generateCategorySEO(category: {
  name: string
  description: string
  image: string
  productCount: number
}): SEOConfig {
  return {
    title: `${category.name} - Fresh Products | Supermarket`,
    description: category.description || `Shop ${category.name} from our supermarket. ${category.productCount} products available.`,
    keywords: [category.name, 'category', 'supermarket', 'groceries', 'fresh'],
    openGraph: {
      title: `${category.name} - ${category.productCount} Products`,
      description: category.description || `Browse ${category.name} from our supermarket`,
      images: [category.image],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - ${category.productCount} Products`,
      description: category.description || `Browse ${category.name} from our supermarket`,
      images: [category.image],
    },
  }
}

export function generateStructuredData(type: string, data: any) {
  switch (type) {
    case 'LocalBusiness':
      return {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: data.name || 'Supermarket',
        description: data.description || 'Fresh groceries and daily essentials',
        image: data.image || '/images/store-logo.jpg',
        telephone: data.telephone || '+1234567890',
        address: {
          '@type': 'PostalAddress',
          streetAddress: data.address?.street || '123 Main Street',
          addressLocality: data.address?.city || 'New York',
          addressRegion: data.address?.state || 'NY',
          postalCode: data.address?.zip || '10001',
          addressCountry: data.address?.country || 'US',
        },
        openingHours: data.openingHours || [
          'Mo-Su 00:00-23:59'
        ],
        priceRange: data.priceRange || '$$',
        paymentAccepted: ['Cash', 'Credit Card', 'Debit Card'],
        currenciesAccepted: 'USD',
      }

    case 'Product':
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        description: data.description,
        image: data.image,
        brand: {
          '@type': 'Brand',
          name: 'Supermarket',
        },
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: data.currency || 'USD',
          availability: data.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Supermarket',
          },
        },
        category: data.category,
      }

    case 'Offer':
      return {
        '@context': 'https://schema.org',
        '@type': 'Offer',
        name: data.name,
        description: data.description,
        discount: data.discount,
        discountCurrency: data.currency || 'USD',
        availability: 'https://schema.org/InStock',
        validFrom: data.validFrom,
        validThrough: data.validThrough,
        seller: {
          '@type': 'Organization',
          name: 'Supermarket',
        },
      }

    default:
      return {}
  }
}
