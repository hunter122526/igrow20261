"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  LogOut, User, Loader, AlertCircle, CheckCircle, Users, TrendingUp,
  Wallet, Gift, Award, FileText, Copy, Check, Home, Plus, ListChecks,
  DollarSign, CreditCard, Bell, Camera
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import DownlineTree from '@/components/DownlineTree'

const REFERRAL_LEVELS = [
  { name: 'GROW STAR', threshold: '2.5 Lakh', rate: '3%', label: 'Special Reward' },
  { name: 'GROW SILVER', threshold: '7.5 Lakh', rate: '3%', label: 'Special Reward' },
  { name: 'GROW GOLD', threshold: '15 Lakh', rate: '3%', label: 'Special Reward' },
  { name: 'GROW PEARL', threshold: '25 Lakh', rate: '3%', label: 'Special Reward' },
  { name: 'GROW RUBY', threshold: '40 Lakh', rate: '5%', label: 'Special Reward' },
  { name: 'GROW SAPPHIRE', threshold: '60 Lakh', rate: '5%', label: 'Special Reward' },
  { name: 'GROW DIAMOND', threshold: '80 Lakh', rate: '5%', label: 'Special Reward' },
  { name: 'GROW KOHINOOR', threshold: '1 Crore', rate: '5%', label: 'Special Reward' }
]

const PAYMENT_METHODS = ['Bank Transfer', 'Crypto Wallet', 'UPI']
const CRYPTO_CURRENCIES = ['USDT', 'BTC', 'ETH', 'BNB', 'SOL']
const INR_TO_USD_RATE = 83.33

function formatCurrency(value: number, currency?: string) {
  const normalizedCurrency = (currency || 'INR').toUpperCase()
  const formatted = value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  if (normalizedCurrency === 'INR') {
    return `₹${formatted}`
  }
  return `$${formatted}`
}

function formatInrWithUsd(value: number) {
  const inrAmount = `₹${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  const usdAmount = `$${(value / INR_TO_USD_RATE).toFixed(2)}`
  return `${inrAmount} / ${usdAmount}`
}

function flattenDownline(node: any | null): any[] {
  if (!node) return []
  return [node, ...flattenDownline(node.left), ...flattenDownline(node.right)]
}

function countDirectLegs(node: any | null) {
  if (!node) return { left: 0, right: 0 }
  return {
    left: node.left ? flattenDownline(node.left).length : 0,
    right: node.right ? flattenDownline(node.right).length : 0,
  }
}

const DASHBOARD_SECTIONS = [
  { icon: Home, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
  { icon: Users, label: 'Member', color: 'from-purple-500 to-pink-500' },
  { icon: TrendingUp, label: 'Income', color: 'from-green-500 to-emerald-500' },
  { icon: ListChecks, label: 'Balance Request', color: 'from-orange-500 to-red-500' },
  { icon: CreditCard, label: 'Topup', color: 'from-indigo-500 to-blue-500' },
  { icon: Wallet, label: 'My Wallet', color: 'from-teal-500 to-green-500' }
]

interface DownlineData {
  user: any
  downline: any
  stats: any
}

interface DashboardStats {
  totalEarnings: number
  directMembers: number
  totalMembers: number
  pendingWithdraw: number
}

export default function UserDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [downlineLoading, setDownlineLoading] = useState(false)
  const [referralLink, setReferralLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [downlineData, setDownlineData] = useState<DownlineData | null>(null)
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    directMembers: 0,
    totalMembers: 0,
    pendingWithdraw: 0
  })
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [walletCurrency, setWalletCurrency] = useState<string>('INR')
  const [commissionBalance, setCommissionBalance] = useState<number>(0)
  const [commissionCurrency, setCommissionCurrency] = useState<string>('INR')
  const [directCommission, setDirectCommission] = useState<number>(0)
  const [teamCommission, setTeamCommission] = useState<number>(0)
  const [balanceRequests, setBalanceRequests] = useState<any[]>([])
  const [balanceRequestError, setBalanceRequestError] = useState('')
  const [topupError, setTopupError] = useState('')
  const [userToken, setUserToken] = useState<string | null>(null)
  const [balanceRequestAmount, setBalanceRequestAmount] = useState('')
  const [balanceRequestCurrency, setBalanceRequestCurrency] = useState<string>(CRYPTO_CURRENCIES[0])
  const [balanceRequestMethod, setBalanceRequestMethod] = useState<string>(PAYMENT_METHODS[0])
  const [topupAmount, setTopupAmount] = useState('')
  const [topupCurrency, setTopupCurrency] = useState<string>(CRYPTO_CURRENCIES[0])
  const [topupHistory, setTopupHistory] = useState<any[]>([])
  const [profileUploadError, setProfileUploadError] = useState('')
  const [profileUploading, setProfileUploading] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      if (!token || !userData) {
        router.push('/login')
        return
      }

      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setUserToken(token)

      await fetchUserProfile(token)
      setLoading(false)

      if (parsedUser.status === 'approved') {
        fetchDownlineData(parsedUser.id)
      }
    }

    load()
  }, [router])

  useEffect(() => {
    if (!downlineData) return

    const directLegs = countDirectLegs(downlineData.downline)
    const totalMembers = Math.max(0, downlineData.stats.totalMembers - 1)
    const pendingWithdraw = balanceRequests.reduce((sum, request) => sum + (request.status === 'pending' ? request.amount : 0), 0)

    setStats({
      totalEarnings: commissionBalance,
      directMembers: directLegs.left + directLegs.right,
      totalMembers,
      pendingWithdraw
    })
    setDirectCommission(0)
    setTeamCommission(0)
  }, [downlineData, balanceRequests, commissionBalance])

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setUser(data.user)
      setWalletBalance(data.user.walletBalance || 0)
      setWalletCurrency(data.user.walletCurrency || 'INR')
      setCommissionBalance(data.user.commissionBalance || 0)
      setCommissionCurrency(data.user.commissionCurrency || 'INR')
      setTopupHistory(data.user.topupHistory || [])
      setBalanceRequests(data.requests || [])
    } catch (error) {
      console.error('Failed to load user profile', error)
      router.push('/login')
    }
  }

  const fetchDownlineData = async (userId: string) => {
    setDownlineLoading(true)
    try {
      const response = await fetch(`/api/registrations/${userId}/downline`)
      const data = await response.json()
      setDownlineData(data)
    } catch (err) {
      console.error('Failed to fetch downline data', err)
    } finally {
      setDownlineLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const code = `IGROW-${user.id}`
    const name = user.name || ''
    setReferralLink(`${origin}/?referralCode=${encodeURIComponent(code)}&referralName=${encodeURIComponent(name)}`)
  }, [user])

  const handleBalanceRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBalanceRequestError('')

    const amount = parseFloat(balanceRequestAmount)
    if (!amount || amount <= 0) {
      setBalanceRequestError('Enter a valid amount')
      return
    }

    if (!userToken) {
      setBalanceRequestError('Unauthorized request')
      return
    }

    try {
      const response = await fetch('/api/user/recharge-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({
          amount,
          currency: balanceRequestCurrency,
          method: balanceRequestMethod,
          note: 'Recharge request from user dashboard'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        setBalanceRequestError(data.error || 'Unable to submit recharge request')
        return
      }

      const data = await response.json()
      setBalanceRequests([data.request, ...balanceRequests])
      setBalanceRequestAmount('')
      setActiveTab('balance request')
    } catch (error) {
      setBalanceRequestError('Failed to submit recharge request')
    }
  }

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setProfileUploadError('Please select a valid image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const imageData = reader.result as string
      if (!userToken) {
        setProfileUploadError('Unauthorized request')
        return
      }

      setProfileUploading(true)
      setProfileUploadError('')

      try {
        const response = await fetch('/api/user/me', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`
          },
          body: JSON.stringify({ profileImage: imageData })
        })

        const data = await response.json()
        if (!response.ok) {
          setProfileUploadError(data.error || 'Failed to upload image')
          return
        }

        setUser(data.user)
      } catch (error) {
        setProfileUploadError('Failed to upload image')
      } finally {
        setProfileUploading(false)
      }
    }

    reader.readAsDataURL(file)
  }

  const handleTopupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTopupError('')

    const amount = parseFloat(topupAmount)
    if (!amount || amount <= 0) {
      setTopupError('Enter a valid topup amount')
      return
    }

    if (!userToken) {
      setTopupError('Unauthorized request')
      return
    }

    try {
      const response = await fetch('/api/user/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        },
        body: JSON.stringify({ amount, currency: topupCurrency })
      })

      if (!response.ok) {
        const data = await response.json()
        setTopupError(data.error || 'Unable to add funds')
        return
      }

      const data = await response.json()
      setWalletBalance(data.walletBalance)
      setWalletCurrency(data.walletCurrency || topupCurrency)
      setTopupHistory(data.topupHistory || [])
      setTopupAmount('')
    } catch (error) {
      setTopupError('Failed to top up wallet')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#06080a] to-[#0a0c0e] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-foreground/60">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const isPending = user?.status === 'pending'
  const isApproved = user?.status === 'approved'
  const legCounts = downlineData ? countDirectLegs(downlineData.downline) : { left: 0, right: 0 }
  const totalBalance = walletBalance + commissionBalance

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06080a] via-[#0a0c0e] to-[#0f1117] text-white pb-24 md:pb-0">
      <div className="flex">
        {/* Modern Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-gradient-to-b from-[#0f1318] to-[#0a0d11] border-r border-white/10 p-6 sticky top-0 h-screen overflow-y-auto">
          {/* Logo */}
          <div className="mb-8">
            <img src="/igrow_logo%20footer.png" alt="iGROW logo" className="w-full max-w-[180px] object-contain" />
          </div>

          {/* User Info */}
          <div className="mb-8 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
            <p className="text-xs text-foreground/60 uppercase tracking-widest mb-1">ID: {user?.id}</p>
            <p className="font-bold text-white text-sm mb-1">{user?.name}</p>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Online
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {DASHBOARD_SECTIONS.map((section, idx) => {
              const Icon = section.icon
              const isActive = activeTab === section.label.toLowerCase()
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(section.label.toLowerCase())}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/30 to-primary/10 text-primary border border-primary/30'
                      : 'text-foreground/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              )
            })}
          </nav>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <img src="/igrow_logo%20footer.png" alt="iGROW logo" className="h-14 object-contain" />
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                  <p className="text-foreground/60 mt-2">Manage your account and track your earnings</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                className="md:hidden bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>

            {/* Status Alerts */}
            {isPending && (
              <Alert className="mb-6 border-yellow-500/30 bg-yellow-500/10 rounded-xl">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-400 ml-3 text-sm">
                  Your registration is pending admin approval. You'll receive an email once activated.
                </AlertDescription>
              </Alert>
            )}

            {isApproved && (
              <Alert className="mb-6 border-green-500/30 bg-green-500/10 rounded-xl">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-400 ml-3 text-sm">
                  ✓ Your account is active! Start enjoying all benefits.
                </AlertDescription>
              </Alert>
            )}

            {/* Stats Cards */}
            {isApproved && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold">Admin Commission</p>
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.totalEarnings, commissionCurrency)}</p>
                  <p className="text-xs text-foreground/50 mt-2">Manual admin-approved commission in {commissionCurrency}</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold">Direct Members</p>
                    <Users className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-green-400">{stats.directMembers}</p>
                  <p className="text-xs text-foreground/50 mt-2">Active members</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold">Network Size</p>
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-purple-400">{stats.totalMembers}</p>
                  <p className="text-xs text-foreground/50 mt-2">Total downline</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold">Pending</p>
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold text-orange-400">{formatCurrency(stats.pendingWithdraw)}</p>
                  <p className="text-xs text-foreground/50 mt-2">Withdraw available</p>
                </div>
              </div>
            )}

            {/* Main Content Tabs */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Profile Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Profile Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-[110px_1fr] gap-6 items-start">
                      <div className="space-y-4">
                        <div className="h-28 w-28 rounded-3xl overflow-hidden border border-white/10 bg-[#02050d] flex items-center justify-center">
                          {user?.profileImage ? (
                            <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2 text-foreground/50">
                              <Camera className="h-6 w-6" />
                              <span className="text-xs">No photo</span>
                            </div>
                          )}
                        </div>
                        <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-foreground/80 hover:bg-white/10 transition-colors">
                          <input type="file" accept="image/*" onChange={handleProfileImageChange} className="sr-only" />
                          {profileUploading ? 'Uploading...' : 'Upload Profile Image'}
                        </label>
                        {profileUploadError && <p className="text-sm text-red-400">{profileUploadError}</p>}
                      </div>
                      <div className="space-y-5">
                        <div className="pb-4 border-b border-white/10">
                          <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold mb-1">Full Name</p>
                          <p className="text-white font-semibold">{user?.name}</p>
                        </div>
                        <div className="pb-4 border-b border-white/10">
                          <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold mb-1">Email Address</p>
                          <p className="text-white font-semibold text-sm">{user?.email}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold mb-1">User ID</p>
                          <p className="text-primary font-mono font-bold">{user?.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm">
                    <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Account Status
                    </h2>
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold mb-2">Status</p>
                        <span className={`px-4 py-2 rounded-lg text-sm font-bold inline-block ${
                          isApproved
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {isPending ? '⏳ Pending Approval' : '✓ Approved'}
                        </span>
                      </div>
                      {isApproved && user?.program && (
                        <>
                          <div className="pt-4 border-t border-white/10">
                            <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold mb-2">Program</p>
                            <p className="text-white font-semibold">{user.program}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold mb-2">Plan Amount</p>
                            <p className="text-green-400 font-bold text-lg">{formatInrWithUsd(user.planAmount || 0)}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Referral Section */}
                {isApproved && (
                  <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-3">
                      <Gift className="w-6 h-6 text-primary" />
                      Referral Program
                    </h2>
                    <p className="text-foreground/60 mb-8">Referral links help grow the network. Commission is credited manually by admin in INR only.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
                        <p className="text-xs uppercase tracking-widest text-green-400 font-bold mb-3">Admin Commission</p>
                        <p className="text-3xl font-bold text-green-400">Manual</p>
                        <p className="text-xs text-foreground/60 mt-3">Commission is approved and added by admin only</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
                        <p className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-3">Referral Tracking</p>
                        <p className="text-3xl font-bold text-blue-400">Tree View</p>
                        <p className="text-xs text-foreground/60 mt-3">Downline structure is tracked for review, not auto-paid</p>
                      </div>
                    </div>

                    <div className="bg-[#0a0d11] border border-white/10 rounded-xl p-6 mb-6">
                      <p className="text-sm font-semibold text-white mb-3">Your Referral Code</p>
                      <div className="flex items-center gap-3 p-4 bg-black/40 rounded-lg border border-primary/20">
                        <code className="flex-1 text-primary font-mono text-sm">{`IGROW-${user?.id}`}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`IGROW-${user?.id}`)
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-foreground/60" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#0a0d11] border border-white/10 rounded-xl p-6">
                      <p className="text-sm font-semibold text-white mb-4">Referral Link</p>
                      <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-primary/20 mb-4 overflow-auto text-xs break-all text-foreground/70">
                        {referralLink || 'Generating link...'}
                      </div>
                      <button
                        onClick={async () => {
                          if (!referralLink) return
                          await navigator.clipboard.writeText(referralLink)
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        }}
                        className="w-full px-4 py-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg font-semibold transition-all"
                      >
                        {copied ? '✓ Link Copied!' : '📋 Copy Referral Link'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Referral Levels */}
                {isApproved && (
                  <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                      <Award className="w-6 h-6 text-primary" />
                      Achievement Levels
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {REFERRAL_LEVELS.map((level, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-primary/20 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold text-white text-sm">{level.name}</p>
                              <p className="text-xs text-foreground/60 mt-1">{level.threshold} turnover</p>
                            </div>
                            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold">{level.rate}</span>
                          </div>
                          <p className="text-xs text-foreground/50">{level.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Downline Tree */}
                {isApproved && downlineData && (
                  <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                      <Users className="w-6 h-6 text-primary" />
                      Downline Network
                    </h2>
                    {downlineLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader className="h-8 w-8 text-primary animate-spin" />
                      </div>
                    ) : (
                      <DownlineTree data={downlineData?.downline} stats={downlineData?.stats} />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Member Tab */}
            {activeTab === 'member' && (
              <div className="space-y-8">
                {isApproved ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 font-bold mb-4">Left Chain</p>
                        <p className="text-4xl font-bold text-primary">{legCounts.left}</p>
                        <p className="text-foreground/50 text-sm mt-2">Users in your left team</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 font-bold mb-4">Right Chain</p>
                        <p className="text-4xl font-bold text-primary">{legCounts.right}</p>
                        <p className="text-foreground/50 text-sm mt-2">Users in your right team</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 font-bold mb-4">Total Structure</p>
                        <p className="text-4xl font-bold text-primary">{stats.totalMembers}</p>
                        <p className="text-foreground/50 text-sm mt-2">Total network members</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left">
                        <p className="text-sm uppercase tracking-[0.18em] text-foreground/60 font-bold mb-3">Left Leg Detail</p>
                        {downlineData?.downline?.left ? (
                          <div className="space-y-2">
                            <p className="text-white font-semibold">{downlineData.downline.left.name}</p>
                            <p className="text-foreground/50 text-sm">{downlineData.downline.left.email}</p>
                            <p className="text-green-400 font-semibold">{formatCurrency(downlineData.downline.left.planAmount)}</p>
                          </div>
                        ) : (
                          <p className="text-foreground/50">No left referrals yet.</p>
                        )}
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left">
                        <p className="text-sm uppercase tracking-[0.18em] text-foreground/60 font-bold mb-3">Right Leg Detail</p>
                        {downlineData?.downline?.right ? (
                          <div className="space-y-2">
                            <p className="text-white font-semibold">{downlineData.downline.right.name}</p>
                            <p className="text-foreground/50 text-sm">{downlineData.downline.right.email}</p>
                            <p className="text-green-400 font-semibold">{formatCurrency(downlineData.downline.right.planAmount)}</p>
                          </div>
                        ) : (
                          <p className="text-foreground/50">No right referrals yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                      <h2 className="text-xl font-bold mb-5 text-white">Live Network Preview</h2>
                      {downlineLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader className="h-8 w-8 text-primary animate-spin" />
                        </div>
                      ) : (
                        <DownlineTree data={downlineData?.downline} stats={downlineData?.stats} />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <p className="text-foreground/60 text-lg">Your member tree and left/right structure will appear after approval and referrals are added.</p>
                  </div>
                )}
              </div>
            )}

            {/* Income Tab */}
            {activeTab === 'income' && (
              <div className="space-y-8">
                {isApproved ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 font-bold mb-4">Manual Commission</p>
                        <p className="text-4xl font-bold text-green-400">{formatCurrency(directCommission, commissionCurrency)}</p>
                        <p className="text-foreground/50 text-sm mt-2">No automatic referral payout; admin credits appear here only</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 font-bold mb-4">Referral Network</p>
                        <p className="text-4xl font-bold text-green-400">{formatCurrency(teamCommission, commissionCurrency)}</p>
                        <p className="text-foreground/50 text-sm mt-2">Downline tracking is shown for review, not auto-paid</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-left">
                        <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 font-bold mb-4">Total Commission</p>
                        <p className="text-4xl font-bold text-primary">{formatCurrency(commissionBalance, commissionCurrency)}</p>
                        <p className="text-foreground/50 text-sm mt-2">Admin-approved commission balance in {commissionCurrency}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <p className="text-sm uppercase tracking-[0.18em] text-foreground/60 font-bold mb-4">Referral Earnings</p>
                        {downlineData ? (
                          <div className="space-y-3 text-sm text-foreground/70">
                            <p><span className="text-white font-semibold">Total team members:</span> {stats.totalMembers}</p>
                            <p><span className="text-white font-semibold">Left chain size:</span> {legCounts.left}</p>
                            <p><span className="text-white font-semibold">Right chain size:</span> {legCounts.right}</p>
                            <p className="text-foreground/50 mt-3">Referral payouts are manual and admin-approved in INR.</p>
                          </div>
                        ) : (
                          <p className="text-foreground/50">No referral data available yet.</p>
                        )}
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <p className="text-sm uppercase tracking-[0.18em] text-foreground/60 font-bold mb-4">Available Wallet</p>
                        <p className="text-3xl font-bold text-primary">{formatCurrency(walletBalance, walletCurrency)}</p>
                        <p className="text-foreground/50 text-sm mt-2">Spendable wallet balance in {walletCurrency}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <p className="text-foreground/60 text-lg">Income details appear after admin approval and commission is manually added in INR.</p>
                  </div>
                )}
              </div>
            )}

            {/* Balance Request Tab */}
            {activeTab === 'balance request' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-4 text-white">Request Balance</h2>
                    <p className="text-foreground/60 mb-6">Request funds from admin using any supported crypto currency.</p>
                    <form onSubmit={handleBalanceRequestSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-[0.18em] text-foreground/60 font-bold mb-2">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={balanceRequestAmount}
                          onChange={(e) => setBalanceRequestAmount(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-[0.18em] text-foreground/60 font-bold mb-2">Currency</label>
                          <select
                            value={balanceRequestCurrency}
                            onChange={(e) => setBalanceRequestCurrency(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white"
                          >
                            {CRYPTO_CURRENCIES.map((currency) => (
                              <option key={currency} value={currency}>{currency}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-[0.18em] text-foreground/60 font-bold mb-2">Method</label>
                          <select
                            value={balanceRequestMethod}
                            onChange={(e) => setBalanceRequestMethod(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white"
                          >
                            {PAYMENT_METHODS.map((method) => (
                              <option key={method} value={method}>{method}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-[#08101a] p-4 text-sm text-foreground/60">
                        Available balance: <span className="text-white font-semibold">{formatCurrency(walletBalance, walletCurrency)}</span>
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-background hover:bg-primary/90 transition"
                      >
                        Submit Request
                      </button>
                      {balanceRequestError && (
                        <p className="text-sm text-red-400 mt-2">{balanceRequestError}</p>
                      )}
                    </form>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-4 text-white">Your Requests</h2>
                    {balanceRequests.length > 0 ? (
                      <div className="space-y-3 text-sm text-foreground/70">
                        {balanceRequests.map((request) => (
                          <div key={request.id} className="rounded-2xl bg-[#0a0f19] border border-white/10 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-white">{formatCurrency(request.amount, request.currency)}</p>
                              <span className="text-xs uppercase tracking-[0.14em] text-foreground/60">{request.status}</span>
                            </div>
                            <p className="text-foreground/50 text-xs mt-2">{request.method} • {request.date}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-foreground/50 text-sm">No balance requests submitted yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Topup Tab */}
            {activeTab === 'topup' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-4 text-white">Wallet Topup</h2>
                    <p className="text-foreground/60 mb-6">Recharge your wallet instantly using supported cryptocurrencies.</p>
                    <form onSubmit={handleTopupSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-[0.18em] text-foreground/60 font-bold mb-2">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={topupAmount}
                          onChange={(e) => setTopupAmount(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-[0.18em] text-foreground/60 font-bold mb-2">Currency</label>
                        <select
                          value={topupCurrency}
                          onChange={(e) => setTopupCurrency(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white"
                        >
                          {CRYPTO_CURRENCIES.map((currency) => (
                            <option key={currency} value={currency}>{currency}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-background hover:bg-primary/90 transition"
                      >
                        Add Funds to Wallet
                      </button>
                      {topupError && (
                        <p className="text-sm text-red-400 mt-2">{topupError}</p>
                      )}
                    </form>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <h2 className="text-xl font-bold mb-4 text-white">Topup History</h2>
                    {topupHistory.length > 0 ? (
                      <div className="space-y-3 text-sm text-foreground/70">
                        {topupHistory.map((entry) => (
                          <div key={entry.id} className="rounded-2xl bg-[#0a0f19] border border-white/10 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-white font-semibold">{formatCurrency(entry.amount, entry.currency)}</p>
                              <span className="text-foreground/50 text-xs">{entry.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-foreground/50 text-sm">No topup history yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* My Wallet Tab */}
            {activeTab === 'my wallet' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 font-bold mb-4">Wallet Balance</p>
                    <p className="text-4xl font-bold text-primary">{formatCurrency(walletBalance, walletCurrency)}</p>
                    <p className="text-foreground/50 text-sm mt-2">Your spendable balance in {walletCurrency}.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 font-bold mb-4">Commission Balance</p>
                    <p className="text-4xl font-bold text-green-400">{formatCurrency(commissionBalance, commissionCurrency)}</p>
                    <p className="text-foreground/50 text-sm mt-2">Admin-approved commission balance in {commissionCurrency}.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 font-bold mb-4">Total Available</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(walletBalance, walletCurrency)}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 font-bold mb-4">Manual Commission</p>
                    <p className="text-3xl font-bold text-green-400">{formatCurrency(directCommission, commissionCurrency)}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-foreground/60 font-bold mb-4">Referral Network</p>
                    <p className="text-3xl font-bold text-green-400">{formatCurrency(teamCommission, commissionCurrency)}</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <h2 className="text-lg font-bold mb-4 text-white">Recent Activity</h2>
                  <div className="grid grid-cols-1 gap-3 text-sm text-foreground/70">
                    <div className="rounded-2xl bg-[#0a0f19] border border-white/10 p-4">
                      <p className="text-white font-semibold">Wallet + Commission</p>
                      <p className="text-foreground/50 mt-2">{formatCurrency(walletBalance, walletCurrency)} available balance</p>
                    </div>
                    <div className="rounded-2xl bg-[#0a0f19] border border-white/10 p-4">
                      <p className="text-white font-semibold">Pending Withdrawal</p>
                      <p className="text-foreground/50 mt-2">{formatCurrency(stats.pendingWithdraw)} in requests</p>
                    </div>
                    <div className="rounded-2xl bg-[#0a0f19] border border-white/10 p-4">
                      <p className="text-white font-semibold">Direct / Team Members</p>
                      <p className="text-foreground/50 mt-2">{stats.directMembers} direct referrals • {stats.totalMembers} total team</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Access */}
            <div className="mt-12 p-8 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 border border-primary/30 rounded-2xl text-center">
              <Bell className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-foreground/80 mb-4 font-semibold">Admin Access</p>
              <Button
                onClick={() => router.push('/admin')}
                className="bg-primary hover:bg-primary/90 text-background px-8 py-3 rounded-lg font-bold transition-all"
              >
                Go to Admin Panel
              </Button>
            </div>

            <div className="pb-8"></div>
          </div>
        </div>
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#02040a]/95 backdrop-blur-xl py-2 md:hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-1 px-3">
            {DASHBOARD_SECTIONS.map((section) => {
              const Icon = section.icon
              const key = section.label.toLowerCase()
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] transition ${activeTab === key ? 'bg-white/10 text-white' : 'bg-white/5 text-foreground/70'}`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{section.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
