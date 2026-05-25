import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export let siteSettings: any = {
  title: 'iGrow 2026',
  tagline: 'Grow with confidence',
  logoUrl: '/IGROW%20LOGO.png',
  footerText: '© iGrow 2026',
  whatsappGroupUrl: 'https://whatsapp.com/channel/igrow-society',
  telegramGroupUrl: 'https://t.me/igrow-society',
  heroBadge: 'Next-Gen Trading Academy',
  heroHeading: 'MASTERY OF THE',
  heroHighlight: 'MARKETS.',
  heroDescription: 'iGrow Society bridges the gap between traditional finance and the decentralized future. Experience professional trading education with AI-driven mentorship.',
  heroPrimaryCta: 'Join The Society',
  heroSecondaryCta: 'View Catalog',
  benefitsLabel: 'Institute Benefits',
  benefitsHeading: 'More Than Just ',
  benefitsHeadingHighlight: 'Education.',
  benefitsDescription: 'Master institutional concepts and gain an edge with an ecosystem designed for high-performance trading.',
  benefitsCta: 'Claim All Benefits',
  sentimentLabel: 'Live Analysis',
  sentimentHeading: 'Global Market ',
  sentimentHeadingHighlight: 'Sentiment',
  sentimentDescription: 'Our proprietary engine analyzes real-time order flow and institutional positioning to give students the edge in every trade.',
  mentorLabel: 'AI Reasoning Engine',
  mentorHeading: 'Find Your Perfect ',
  mentorHeadingHighlight: 'Strategy',
  mentorDescription: 'Tell our AI Mentor about your goals and experience, and we\'ll craft the ideal educational path for your success.',
  mentorCta: 'Consult AI Mentor',
  programsLabel: 'Our Programs',
  programsHeading: 'iGrow Learning ',
  programsHeadingHighlight: 'Institute.',
  programsDescription: 'Course & Admission Programs designed to transform your financial future.',
  partnersHeading: 'Institutional Partners & Liquidity',
  reviewsHeading: 'Success ',
  reviewsHeadingHighlight: 'Stories',
  reviewsDescription: 'Hear from our students who transformed their trading journey through logic and institutional reasoning.'
}

export async function GET() {
  try {
    return NextResponse.json(siteSettings)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAdminAuth(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    siteSettings = { ...siteSettings, ...body }
    return NextResponse.json({ message: 'Site settings updated', siteSettings })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
