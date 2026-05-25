
"use client"

import React, { Suspense, useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Hero } from '@/components/sections/Hero'
import { Programs } from '@/components/sections/Programs'
import { MentorTool } from '@/components/sections/MentorTool'
import { Benefits } from '@/components/sections/Benefits'
import { SentimentWidget } from '@/components/sections/SentimentWidget'
import { CryptoSlider } from '@/components/sections/CryptoSlider'
import { Partners } from '@/components/sections/Partners'
import { Reviews } from '@/components/sections/Reviews'
import { Footer } from '@/components/layout/Footer'
import { EnrollModal } from '@/components/modals/EnrollModal'
import dynamic from 'next/dynamic'
const SupportChat = dynamic(() => import('@/components/SupportChat'), { ssr: false })

export default function Home() {
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [siteSettings, setSiteSettings] = useState<any>(null)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    // Open the popup automatically after a short delay on mount
    const timer = setTimeout(() => {
      setShowWelcomePopup(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    async function loadSiteSettings() {
      setPageLoading(true)
      try {
        const response = await fetch('/api/site')
        const data = await response.json()
        setSiteSettings(data.siteSettings || data)
      } catch (err) {
        console.error('Failed to load site settings', err)
      } finally {
        setPageLoading(false)
      }
    }

    loadSiteSettings()
  }, [])

  if (pageLoading) {
    return (
      <main className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-6 px-6 py-8 rounded-[2rem] bg-slate-950/95 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="relative w-28 h-28" style={{ perspective: '900px' }}>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/10 via-sky-500/10 to-transparent blur-2xl" />
            <div className="relative w-full h-full transform-gpu [transform-style:preserve-3d] animate-[spin_2s_linear_infinite]">
              <div className="absolute inset-0 rounded-3xl border border-cyan-400/20 bg-[#06111d]/90 shadow-[0_0_50px_rgba(56,189,248,0.25)]" />
              <div className="absolute inset-0 rounded-3xl border border-sky-300/10 rotate-45" />
              <div className="absolute inset-0 rounded-3xl border border-cyan-400/10 rotate-90" />
              <div className="absolute inset-4 rounded-3xl border border-cyan-200/20 animate-[pulse_1.4s_ease-in-out_infinite]" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-2">Loading iGrow</p>
            <p className="text-xl font-bold">Preparing your landing experience...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <Navbar />
      
      {/* Auto-opening Enrollment Modal */}
      <Suspense fallback={null}>
        <EnrollModal open={showWelcomePopup} onOpenChange={setShowWelcomePopup} />
      </Suspense>

      <Hero settings={siteSettings} />
      <CryptoSlider settings={siteSettings} />
      
      {/* Live Analysis Section */}
      <SentimentWidget settings={siteSettings} />
      
      {/* Institute Benefits - Below Live Analysis */}
      <Benefits settings={siteSettings} />
      
      <MentorTool settings={siteSettings} />
      <Programs settings={siteSettings} />
      
      {/* New Sections */}
      <Partners settings={siteSettings} />
      <Reviews settings={siteSettings} />
      
      <Footer />
      <SupportChat />
      
      {/* Global Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>
    </main>
  )
}
