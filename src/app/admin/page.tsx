"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  AlertCircle, LogOut, Shield, Loader, Check, X, Search, TrendingUp,
  Users, DollarSign, Eye, EyeOff, Activity, Filter, Download, MessageCircle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<'registrations' | 'site' | 'users' | 'recharges' | 'assistant'>('registrations')
  const [siteSettings, setSiteSettings] = useState<any>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [logoUploadError, setLogoUploadError] = useState('')

  const [rechargeRequests, setRechargeRequests] = useState<any[]>([])
  const [requestActionLoading, setRequestActionLoading] = useState<string | null>(null)
  const [selectedRechargeUserId, setSelectedRechargeUserId] = useState('')
  const [rechargeAmount, setRechargeAmount] = useState('')
  const [rechargeCurrency, setRechargeCurrency] = useState('USDT')
  const [rechargeNote, setRechargeNote] = useState('')

  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({})
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPhone, setNewUserPhone] = useState('')
  const [newUserProgram, setNewUserProgram] = useState('')
  const [creatingUser, setCreatingUser] = useState(false)
  const [selectedTreeUserId, setSelectedTreeUserId] = useState('')
  const [treeData, setTreeData] = useState<any | null>(null)
  const [treeLoading, setTreeLoading] = useState(false)
  const [commissionAmount, setCommissionAmount] = useState('')
  const isMobile = useIsMobile()
  const [commissionAction, setCommissionAction] = useState<'add' | 'deduct' | 'set'>('add')
  const [commissionLoading, setCommissionLoading] = useState(false)

  useEffect(() => {
    checkAdminSession()
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      fetchRegistrations()
      fetchRechargeRequests()
    }
  }, [isLoggedIn])

  const checkAdminSession = async () => {
    setAuthLoading(true)
    try {
      const response = await fetch('/api/admin/me')
      if (response.ok) {
        setIsLoggedIn(true)
      } else {
        setIsLoggedIn(false)
      }
    } catch (err) {
      setIsLoggedIn(false)
    } finally {
      setAuthLoading(false)
    }
  }

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/registrations')
      if (response.status === 401) {
        setIsLoggedIn(false)
        setError('Your admin session expired. Please log in again.')
        return
      }
      const data = await response.json()
      setRegistrations(data.registrations || [])
    } catch (err) {
      setError('Failed to fetch registrations')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      })
      
      if (response.ok) {
        setError('')
        await fetchRegistrations()
      } else {
        setError('Failed to approve registration')
      }
    } catch (err) {
      setError('Error approving registration')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(id)
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: 'Rejected by admin' })
      })
      
      if (response.ok) {
        setError('')
        await fetchRegistrations()
      } else {
        setError('Failed to reject registration')
      }
    } catch (err) {
      setError('Error rejecting registration')
    } finally {
      setActionLoading(null)
    }
  }

  const fetchRechargeRequests = async () => {
    try {
      const response = await fetch('/api/recharge-requests')
      if (response.status === 401) {
        setIsLoggedIn(false)
        setError('Your admin session expired. Please log in again.')
        return
      }
      const data = await response.json()
      setRechargeRequests(data.requests || [])
    } catch (err) {
      setError('Failed to fetch recharge requests')
    }
  }

  const handleApproveRecharge = async (id: string) => {
    setRequestActionLoading(id)
    try {
      const response = await fetch(`/api/recharge-requests/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      })
      if (response.ok) {
        setError('')
        await fetchRechargeRequests()
        await fetchRegistrations()
      } else {
        setError('Failed to approve recharge request')
      }
    } catch (err) {
      setError('Error approving recharge request')
    } finally {
      setRequestActionLoading(null)
    }
  }

  const handleRejectRecharge = async (id: string) => {
    setRequestActionLoading(id)
    try {
      const response = await fetch(`/api/recharge-requests/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: 'Rejected by admin' })
      })
      if (response.ok) {
        setError('')
        await fetchRechargeRequests()
      } else {
        setError('Failed to reject recharge request')
      }
    } catch (err) {
      setError('Error rejecting recharge request')
    } finally {
      setRequestActionLoading(null)
    }
  }

  const handleRechargeUser = async (e?: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
    if (e?.preventDefault) {
      e.preventDefault()
    }
    if (!selectedRechargeUserId) {
      setError('Select a user first')
      return
    }

    setRequestActionLoading(selectedRechargeUserId)
    try {
      const response = await fetch(`/api/users/${selectedRechargeUserId}/recharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: rechargeAmount, currency: rechargeCurrency, note: rechargeNote })
      })
      if (response.ok) {
        setError('')
        setRechargeAmount('')
        setRechargeNote('')
        await fetchRegistrations()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to credit user wallet')
      }
    } catch (err) {
      setError('Error crediting user wallet')
    } finally {
      setRequestActionLoading(null)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setAuthLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Invalid username or password')
        setIsLoggedIn(false)
      } else {
        setIsLoggedIn(true)
        setUsername("")
        setPassword("")
        setError("")
        await fetchRegistrations()
      }
    } catch (err) {
      setError('Error logging in')
      setIsLoggedIn(false)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch (err) {
      // ignore logout errors
    }
    setIsLoggedIn(false)
    setUsername("")
    setPassword("")
    setSearchTerm("")
    setError("")
  }

  const fetchSiteSettings = async () => {
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/site')
      const data = await res.json()
      setSiteSettings(data)
    } catch (err) {
      setError('Failed to load site settings')
    } finally {
      setSettingsLoading(false)
    }
  }

  const updateSiteSettings = async () => {
    try {
      setSettingsLoading(true)
      const res = await fetch('/api/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err?.error || 'Failed to update settings')
      } else {
        setError('')
      }
    } catch (err) {
      setError('Error updating site settings')
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const allowedTypes = ['image/png', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setLogoUploadError('Please upload a PNG or SVG logo file.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setLogoUploadError('')
      setSiteSettings((prev: any) => ({ ...prev, logoUrl: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingUser(true)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName, email: newUserEmail, phone: newUserPhone, program: newUserProgram })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to create user')
      } else {
        setError('')
        if (data?.registration) {
          setRegistrations(prev => [data.registration, ...prev])
          setRevealedPasswords(prev => ({ ...prev, [data.registration.id]: true }))
        }
        setNewUserName('')
        setNewUserEmail('')
        setNewUserPhone('')
        setNewUserProgram('')
      }
    } catch (err) {
      setError('Error creating user')
    } finally {
      setCreatingUser(false)
    }
  }

  const toggleReveal = (id: string) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Assistant QA management state
  const [qaEntries, setQaEntries] = useState<any[]>([])
  const [qaLoading, setQaLoading] = useState(false)
  const [newQaQuestion, setNewQaQuestion] = useState('')
  const [newQaAnswer, setNewQaAnswer] = useState('')
  const [qaActionLoading, setQaActionLoading] = useState<string | null>(null)

  const fetchQaEntries = async () => {
    setQaLoading(true)
    try {
      const res = await fetch('/api/admin/assistant-qa')
      if (res.status === 401) {
        setIsLoggedIn(false)
        setError('Your admin session expired. Please log in again.')
        return
      }
      const data = await res.json()
      setQaEntries(data.entries || [])
    } catch (err) {
      setError('Failed to load assistant entries')
    } finally {
      setQaLoading(false)
    }
  }

  const handleAddQa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQaQuestion || !newQaAnswer) {
      setError('Question and answer required')
      return
    }
    setQaActionLoading('add')
    try {
      const res = await fetch('/api/admin/assistant-qa', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: newQaQuestion, answer: newQaAnswer })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to add entry')
      } else {
        setQaEntries(prev => [data.entry, ...prev])
        setNewQaQuestion('')
        setNewQaAnswer('')
        setError('')
      }
    } catch (err) {
      setError('Error adding entry')
    } finally {
      setQaActionLoading(null)
    }
  }

  const handleDeleteQa = async (id: string) => {
    setQaActionLoading(id)
    try {
      const res = await fetch(`/api/admin/assistant-qa/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to delete')
      } else {
        setQaEntries(prev => prev.filter(e => e.id !== id))
      }
    } catch (err) {
      setError('Error deleting entry')
    } finally {
      setQaActionLoading(null)
    }
  }

  const flattenTree = (node: any | null, level = 0): any[] => {
    if (!node) return []
    const current = { id: node.id, name: node.name, email: node.email, planAmount: node.planAmount, status: node.status, level }
    return [current, ...flattenTree(node.left, level + 1), ...flattenTree(node.right, level + 1)]
  }

  const fetchUserDownline = async (userId: string) => {
    setTreeLoading(true)
    try {
      const res = await fetch(`/api/registrations/${userId}/downline`)
      if (!res.ok) {
        setError('Failed to fetch downline')
        setTreeData(null)
        return
      }
      const data = await res.json()
      setTreeData(data)
    } catch (err) {
      setError('Error loading downline')
      setTreeData(null)
    } finally {
      setTreeLoading(false)
    }
  }

  const openUserTree = async (userId: string) => {
    setSelectedTreeUserId(userId)
    await fetchUserDownline(userId)
  }

  const closeUserTree = () => {
    setSelectedTreeUserId('')
    setTreeData(null)
    setCommissionAmount('')
  }

  const handleUpdateCommission = async (userId: string) => {
    if (!commissionAmount) {
      setError('Enter commission amount')
      return
    }
    setCommissionLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}/commission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: commissionAmount, action: commissionAction, reason: 'Adjusted by admin' })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update commission')
      } else {
        setError('')
        await fetchRegistrations()
        if (selectedTreeUserId) await fetchUserDownline(selectedTreeUserId)
      }
    } catch (err) {
      setError('Error updating commission')
    } finally {
      setCommissionLoading(false)
      setCommissionAmount('')
    }
  }

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm) ||
      reg.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === "all" || reg.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
    totalRevenue: registrations.reduce((sum: number, reg: any) => {
      const priceMatch = reg.program.match(/₹([\d,]+)/)
      const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0
      return sum + price
    }, 0)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#06080a] via-[#0a0c0e] to-[#0f1117] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 mb-4 shadow-lg shadow-primary/20">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Admin Panel</h1>
            <p className="text-foreground/60 text-sm">Secure access to registration management</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
            {error && (
              <Alert className="border-red-500/30 bg-red-500/10 rounded-xl">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400 text-sm ml-3">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-[0.15em] font-bold text-foreground/70">Username</Label>
              <Input
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/5 border border-white/20 rounded-lg h-12 text-sm focus:ring-primary focus:border-primary transition-all placeholder:text-foreground/30"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-[0.15em] font-bold text-foreground/70">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border border-white/20 rounded-lg h-12 text-sm focus:ring-primary focus:border-primary transition-all placeholder:text-foreground/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/70"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white py-3 text-base font-bold rounded-lg shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {authLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign In to Admin'
              )}
            </Button>

            {/* Demo Info */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-foreground/50 uppercase tracking-[0.1em] font-bold mb-3">Demo Credentials:</p>
              <div className="space-y-2 text-xs text-foreground/60 bg-black/30 rounded-lg p-4 border border-white/5">
                <div><span className="text-primary font-semibold">Username:</span> admin</div>
                <div><span className="text-primary font-semibold">Password:</span> admin123</div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-foreground/40 mt-6">Unauthorized access is prohibited</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06080a] via-[#0a0c0e] to-[#0f1117] text-white p-4 pb-24 md:p-8 md:pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-foreground/60 text-sm">Manage registrations and monitor platform activity</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-medium px-6 py-2 flex items-center gap-2 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
<div className="hidden md:flex mb-6 flex-wrap items-center gap-3">
          <button onClick={() => setActiveTab('registrations')} className={`px-4 py-2 rounded-md ${activeTab==='registrations' ? 'bg-primary text-white' : 'bg-white/5 text-foreground/70'}`}>Registrations</button>
          <button onClick={() => { setActiveTab('site'); fetchSiteSettings(); }} className={`px-4 py-2 rounded-md ${activeTab==='site' ? 'bg-primary text-white' : 'bg-white/5 text-foreground/70'}`}>Site</button>
          <button onClick={() => { setActiveTab('users'); }} className={`px-4 py-2 rounded-md ${activeTab==='users' ? 'bg-primary text-white' : 'bg-white/5 text-foreground/70'}`}>Users</button>
          <button onClick={() => { setActiveTab('recharges'); fetchRechargeRequests() }} className={`px-4 py-2 rounded-md ${activeTab==='recharges' ? 'bg-primary text-white' : 'bg-white/5 text-foreground/70'}`}>Recharge Requests</button>
          <button onClick={() => { setActiveTab('assistant'); fetchQaEntries() }} className={`px-4 py-2 rounded-md ${activeTab==='assistant' ? 'bg-primary text-white' : 'bg-white/5 text-foreground/70'}`}>Assistant</button>
        </div>

        {activeTab === 'registrations' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold">Total Registrations</p>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
            <div className="mt-3 flex gap-3 text-xs">
              <span className="text-green-400"><span className="font-bold">{stats.approved}</span> Approved</span>
              <span className="text-yellow-400"><span className="font-bold">{stats.pending}</span> Pending</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">₹{(stats.totalRevenue).toLocaleString()}</p>
            <p className="text-xs text-foreground/50 mt-3">From all registrations</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold">Pending Approvals</p>
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">{stats.pending}</p>
            <p className="text-xs text-foreground/50 mt-3">Awaiting review</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-foreground/60 font-bold">Rejection Rate</p>
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-orange-400">{stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%</p>
            <p className="text-xs text-foreground/50 mt-3">{stats.rejected} rejected</p>
          </div>
        </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <Input
              placeholder="Search by name, email, phone, or referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/20 rounded-lg h-11 pl-10 text-sm focus:ring-primary focus:border-primary transition-all placeholder:text-foreground/30"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-sm focus:ring-primary focus:border-primary transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button
            onClick={fetchRegistrations}
            className="bg-primary hover:bg-primary/90 text-white px-6 rounded-lg font-medium transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

          {/* Registrations Table */}
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
                <p className="text-foreground/60">Loading registrations...</p>
              </div>
            </div>
          ) : filteredRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground/70">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground/70">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground/70">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground/70">Wallet</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground/70">Commission</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground/70">Program</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground/70">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground/70">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-white group-hover:text-primary transition-colors">{reg.name}</td>
                      <td className="px-6 py-4 text-foreground/70 text-xs font-mono">{reg.email}</td>
                      <td className="px-6 py-4 text-foreground/70 text-sm">{reg.phone}</td>
                      <td className="px-6 py-4 font-semibold text-green-400">₹{(reg.walletBalance || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-foreground/70">₹{(reg.commissionBalance || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full font-medium border border-primary/30">
                          {reg.program}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-400">
                        {reg.planAmount ? `₹${reg.planAmount.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 text-xs rounded-full font-bold inline-flex items-center gap-1 border ${
                          reg.status === 'approved' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : reg.status === 'rejected' 
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {reg.status === 'approved' && <Check className="w-3 h-3" />}
                          {reg.status === 'rejected' && <X className="w-3 h-3" />}
                          {reg.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                          {reg.status === 'approved' ? 'Approved' : 
                           reg.status === 'rejected' ? 'Rejected' : 
                           'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {reg.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(reg.id)}
                                disabled={actionLoading === reg.id}
                                className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium transition-all flex items-center gap-1 disabled:opacity-50"
                              >
                              {actionLoading === reg.id ? (
                                <Loader className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(reg.id)}
                              disabled={actionLoading === reg.id}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-all flex items-center gap-1 disabled:opacity-50"
                            >
                              {actionLoading === reg.id ? (
                                <Loader className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-foreground/40 text-xs font-medium">No actions</span>
                        )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Users className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
                <p className="text-foreground/50">No registrations found</p>
              </div>
            </div>
          )}
        </div>

          {/* Footer Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-foreground/60 text-xs uppercase font-bold">Showing</p>
            <p className="text-white font-bold text-lg mt-1">{filteredRegistrations.length}</p>
            <p className="text-foreground/50 text-xs mt-1">of {registrations.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-foreground/60 text-xs uppercase font-bold">Pending</p>
            <p className="text-yellow-400 font-bold text-lg mt-1">{stats.pending}</p>
            <p className="text-foreground/50 text-xs mt-1">awaiting review</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-foreground/60 text-xs uppercase font-bold">Approved</p>
            <p className="text-green-400 font-bold text-lg mt-1">{stats.approved}</p>
            <p className="text-foreground/50 text-xs mt-1">active accounts</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-foreground/60 text-xs uppercase font-bold">Avg Amount</p>
            <p className="text-primary font-bold text-lg mt-1">₹{filteredRegistrations.length > 0 ? Math.round(filteredRegistrations.reduce((sum: number, reg: any) => {
              const priceMatch = reg.program.match(/₹([\d,]+)/)
              const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0
              return sum + price
            }, 0) / filteredRegistrations.length) : 0}</p>
            <p className="text-foreground/50 text-xs mt-1">per registration</p>
          </div>
            </div>
          </>
        )}

        {activeTab === 'site' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold">Site Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Site Title</Label>
                  <Input value={siteSettings?.title || ''} onChange={(e) => setSiteSettings({...siteSettings, title: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Tagline</Label>
                  <Input value={siteSettings?.tagline || ''} onChange={(e) => setSiteSettings({...siteSettings, tagline: e.target.value})} className="mt-2" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-foreground/60">Logo URL</Label>
                  <Input value={siteSettings?.logoUrl || ''} onChange={(e) => setSiteSettings({...siteSettings, logoUrl: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Footer Text</Label>
                  <Input value={siteSettings?.footerText || ''} onChange={(e) => setSiteSettings({...siteSettings, footerText: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">WhatsApp Group Link</Label>
                  <Input value={siteSettings?.whatsappGroupUrl || ''} onChange={(e) => setSiteSettings({...siteSettings, whatsappGroupUrl: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Telegram Group Link</Label>
                  <Input value={siteSettings?.telegramGroupUrl || ''} onChange={(e) => setSiteSettings({...siteSettings, telegramGroupUrl: e.target.value})} className="mt-2" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Upload PNG or SVG Logo</Label>
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleLogoFileChange}
                    className="mt-2 block w-full text-sm text-foreground/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white"
                  />
                  {logoUploadError && <p className="text-sm text-red-400">{logoUploadError}</p>}
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Hero Badge</Label>
                  <Input value={siteSettings?.heroBadge || ''} onChange={(e) => setSiteSettings({...siteSettings, heroBadge: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Hero Heading</Label>
                  <Input value={siteSettings?.heroHeading || ''} onChange={(e) => setSiteSettings({...siteSettings, heroHeading: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Hero Highlight</Label>
                  <Input value={siteSettings?.heroHighlight || ''} onChange={(e) => setSiteSettings({...siteSettings, heroHighlight: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Hero Description</Label>
                  <Textarea value={siteSettings?.heroDescription || ''} onChange={(e) => setSiteSettings({...siteSettings, heroDescription: e.target.value})} className="mt-2 h-28" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Hero Primary CTA</Label>
                  <Input value={siteSettings?.heroPrimaryCta || ''} onChange={(e) => setSiteSettings({...siteSettings, heroPrimaryCta: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Hero Secondary CTA</Label>
                  <Input value={siteSettings?.heroSecondaryCta || ''} onChange={(e) => setSiteSettings({...siteSettings, heroSecondaryCta: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Benefits Label</Label>
                  <Input value={siteSettings?.benefitsLabel || ''} onChange={(e) => setSiteSettings({...siteSettings, benefitsLabel: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Benefits Heading</Label>
                  <Input value={siteSettings?.benefitsHeading || ''} onChange={(e) => setSiteSettings({...siteSettings, benefitsHeading: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Benefits Heading Highlight</Label>
                  <Input value={siteSettings?.benefitsHeadingHighlight || ''} onChange={(e) => setSiteSettings({...siteSettings, benefitsHeadingHighlight: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Benefits Description</Label>
                  <Textarea value={siteSettings?.benefitsDescription || ''} onChange={(e) => setSiteSettings({...siteSettings, benefitsDescription: e.target.value})} className="mt-2 h-28" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Benefits CTA</Label>
                  <Input value={siteSettings?.benefitsCta || ''} onChange={(e) => setSiteSettings({...siteSettings, benefitsCta: e.target.value})} className="mt-2" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Sentiment Label</Label>
                  <Input value={siteSettings?.sentimentLabel || ''} onChange={(e) => setSiteSettings({...siteSettings, sentimentLabel: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Sentiment Heading</Label>
                  <Input value={siteSettings?.sentimentHeading || ''} onChange={(e) => setSiteSettings({...siteSettings, sentimentHeading: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Sentiment Heading Highlight</Label>
                  <Input value={siteSettings?.sentimentHeadingHighlight || ''} onChange={(e) => setSiteSettings({...siteSettings, sentimentHeadingHighlight: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Sentiment Description</Label>
                  <Textarea value={siteSettings?.sentimentDescription || ''} onChange={(e) => setSiteSettings({...siteSettings, sentimentDescription: e.target.value})} className="mt-2 h-28" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Mentor Label</Label>
                  <Input value={siteSettings?.mentorLabel || ''} onChange={(e) => setSiteSettings({...siteSettings, mentorLabel: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Mentor Heading</Label>
                  <Input value={siteSettings?.mentorHeading || ''} onChange={(e) => setSiteSettings({...siteSettings, mentorHeading: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Mentor Heading Highlight</Label>
                  <Input value={siteSettings?.mentorHeadingHighlight || ''} onChange={(e) => setSiteSettings({...siteSettings, mentorHeadingHighlight: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Mentor Description</Label>
                  <Textarea value={siteSettings?.mentorDescription || ''} onChange={(e) => setSiteSettings({...siteSettings, mentorDescription: e.target.value})} className="mt-2 h-28" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Mentor CTA</Label>
                  <Input value={siteSettings?.mentorCta || ''} onChange={(e) => setSiteSettings({...siteSettings, mentorCta: e.target.value})} className="mt-2" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Programs Label</Label>
                  <Input value={siteSettings?.programsLabel || ''} onChange={(e) => setSiteSettings({...siteSettings, programsLabel: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Programs Heading</Label>
                  <Input value={siteSettings?.programsHeading || ''} onChange={(e) => setSiteSettings({...siteSettings, programsHeading: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Programs Heading Highlight</Label>
                  <Input value={siteSettings?.programsHeadingHighlight || ''} onChange={(e) => setSiteSettings({...siteSettings, programsHeadingHighlight: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Programs Description</Label>
                  <Textarea value={siteSettings?.programsDescription || ''} onChange={(e) => setSiteSettings({...siteSettings, programsDescription: e.target.value})} className="mt-2 h-28" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Partners Heading</Label>
                  <Input value={siteSettings?.partnersHeading || ''} onChange={(e) => setSiteSettings({...siteSettings, partnersHeading: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Reviews Heading</Label>
                  <Input value={siteSettings?.reviewsHeading || ''} onChange={(e) => setSiteSettings({...siteSettings, reviewsHeading: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Reviews Heading Highlight</Label>
                  <Input value={siteSettings?.reviewsHeadingHighlight || ''} onChange={(e) => setSiteSettings({...siteSettings, reviewsHeadingHighlight: e.target.value})} className="mt-2" />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Reviews Description</Label>
                  <Textarea value={siteSettings?.reviewsDescription || ''} onChange={(e) => setSiteSettings({...siteSettings, reviewsDescription: e.target.value})} className="mt-2 h-28" />
                </div>
              </div>
            </div>

            {siteSettings?.logoUrl ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase text-foreground/60 mb-2">Logo Preview</p>
                <div className="inline-flex items-center justify-center rounded-lg bg-background p-4">
                  <img src={siteSettings.logoUrl} alt="Logo preview" className="h-16 object-contain" />
                </div>
              </div>
            ) : null}
            <div className="mt-4 flex gap-3 flex-wrap">
              <Button onClick={updateSiteSettings} className="bg-primary">Save</Button>
              <Button onClick={fetchSiteSettings} className="bg-white/5">Reset</Button>
            </div>
          </div>
        )}

        {activeTab === 'recharges' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold">Recharge Requests</h2>
                <p className="text-foreground/60 text-sm">Approve or reject recharge requests submitted by users.</p>
              </div>
              <Button onClick={fetchRechargeRequests} className="bg-primary">Refresh</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-foreground/60">User</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-foreground/60">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-foreground/60">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-foreground/60">Currency</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-foreground/60">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-foreground/60">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {rechargeRequests.length > 0 ? (
                    rechargeRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-white/5">
                        <td className="px-4 py-3 font-medium text-white">{request.userName}</td>
                        <td className="px-4 py-3 text-foreground/70 text-xs font-mono">{request.userEmail}</td>
                        <td className="px-4 py-3 text-green-400 font-semibold">₹{request.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-foreground/70">{request.currency}</td>
                        <td className="px-4 py-3 text-foreground/70">{request.status}</td>
                        <td className="px-4 py-3">
                          {request.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveRecharge(request.id)}
                                disabled={requestActionLoading === request.id}
                                className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRecharge(request.id)}
                                disabled={requestActionLoading === request.id}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-foreground/50 text-xs">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-foreground/50">No recharge requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold">Manual Wallet Topup</h2>
                  <p className="text-foreground/60 text-sm">Select a user and credit their wallet instantly.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-end">
                <div className="lg:col-span-2">
                  <Label className="text-xs uppercase text-foreground/60">User</Label>
                  <select
                    value={selectedRechargeUserId}
                    onChange={(e) => setSelectedRechargeUserId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white"
                  >
                    <option value="">Select user</option>
                    {registrations.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} — {user.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Amount</Label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    placeholder="Amount"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase text-foreground/60">Currency</Label>
                  <select
                    value={rechargeCurrency}
                    onChange={(e) => setRechargeCurrency(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <Label className="text-xs uppercase text-foreground/60">Note</Label>
                  <input
                    type="text"
                    value={rechargeNote}
                    onChange={(e) => setRechargeNote(e.target.value)}
                    placeholder="Notes (optional)"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white"
                  />
                </div>
                <Button type="button" onClick={handleRechargeUser} className="bg-primary lg:col-span-1">Credit Wallet</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Manage Users</h2>

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              <Input placeholder="Name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
              <Input placeholder="Email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
              <Input placeholder="Phone" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} />
              <div className="flex gap-2">
                <Input placeholder="Program" value={newUserProgram} onChange={(e) => setNewUserProgram(e.target.value)} />
                <Button type="submit" className="bg-primary">Create</Button>
              </div>
            </form>

            {selectedRechargeUserId && (
              <div className="mb-6 rounded-2xl border border-white/10 bg-black/40 p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-foreground/60 font-bold mb-1">Credit Wallet To</p>
                    <p className="text-white font-semibold">{registrations.find((user) => user.id === selectedRechargeUserId)?.name || 'Selected user'}</p>
                    <p className="text-foreground/60 text-sm mt-1">Balance: ₹{(registrations.find((user) => user.id === selectedRechargeUserId)?.walletBalance || 0).toLocaleString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRechargeUserId('')}
                    className="text-foreground/50 text-sm hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleRechargeUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    placeholder="Amount"
                    className="w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white"
                  />
                  <select
                    value={rechargeCurrency}
                    onChange={(e) => setRechargeCurrency(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white"
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                  <input
                    type="text"
                    value={rechargeNote}
                    onChange={(e) => setRechargeNote(e.target.value)}
                    placeholder="Note (optional)"
                    className="w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white"
                  />
                  <Button type="submit" className="bg-primary">Credit Wallet</Button>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase text-foreground/60">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase text-foreground/60">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase text-foreground/60">Phone</th>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase text-foreground/60">Wallet</th>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase text-foreground/60">Password</th>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase text-foreground/60">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {registrations.map((u) => (
                    <tr key={u.id} className="group hover:bg-white/5">
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3 text-xs font-mono">{u.email}</td>
                      <td className="px-4 py-3">₹{(u.walletBalance || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-mono">
                        {revealedPasswords[u.id] ? u.password : '•'.repeat(8)}
                        <button onClick={() => toggleReveal(u.id)} className="ml-3 text-primary text-xs">{revealedPasswords[u.id] ? 'Hide' : 'Show'}</button>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRechargeUserId(u.id)}
                          className="px-3 py-1 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold"
                        >
                          Credit Wallet
                        </button>
                        <button
                          type="button"
                          onClick={() => openUserTree(u.id)}
                          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/70 text-xs font-semibold"
                        >
                          View Tree
                        </button>
                        <button
                          type="button"
                          onClick={() => openUserTree(u.id)}
                          className="px-3 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-xs font-semibold"
                        >
                          Commission
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'assistant' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Growi — Assistant Knowledge Base</h2>

            <form onSubmit={handleAddQa} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input placeholder="Question" value={newQaQuestion} onChange={e => setNewQaQuestion(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white" />
              <input placeholder="Answer" value={newQaAnswer} onChange={e => setNewQaAnswer(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white" />
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary" disabled={qaActionLoading === 'add'}>{qaActionLoading === 'add' ? 'Adding...' : 'Add Entry'}</Button>
                <Button onClick={() => { setNewQaQuestion(''); setNewQaAnswer('') }} className="bg-white/5">Clear</Button>
              </div>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase text-foreground/60">Question</th>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase text-foreground/60">Answer</th>
                    <th className="px-4 py-2 text-left text-xs font-bold uppercase text-foreground/60">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {qaLoading ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-foreground/60">Loading…</td></tr>
                  ) : qaEntries.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-foreground/60">No entries yet.</td></tr>
                  ) : (
                    qaEntries.map(e => (
                      <tr key={e.id} className="hover:bg-white/5">
                        <td className="px-4 py-3 max-w-[300px] truncate">{e.question}</td>
                        <td className="px-4 py-3 max-w-[400px] truncate">{e.answer}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteQa(e.id)} disabled={qaActionLoading === e.id} className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTreeUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="max-w-3xl w-full bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Downline & Commission</h3>
                <button onClick={closeUserTree} className="text-foreground/60 hover:text-white">Close</button>
              </div>

              {treeLoading ? (
                <div className="py-8 text-center text-foreground/60">Loading downline...</div>
              ) : treeData ? (
                <>
                  <div className="mb-4 text-sm text-foreground/70">
                    <p>User: {registrations.find(r => r.id === selectedTreeUserId)?.name}</p>
                    <p>Commission Balance: {registrations.find(r => r.id === selectedTreeUserId)?.commissionBalance ?? 0}</p>
                  </div>

                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-bold text-foreground/60">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-foreground/60">Email</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-foreground/60">Plan</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-foreground/60">Status</th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-foreground/60">Level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {flattenTree(treeData.root || treeData).map((n) => (
                          <tr key={n.id} className="group hover:bg-white/5">
                            <td className="px-3 py-2">{n.name}</td>
                            <td className="px-3 py-2 text-xs font-mono">{n.email}</td>
                            <td className="px-3 py-2">{n.planAmount || '-'}</td>
                            <td className="px-3 py-2">{n.status}</td>
                            <td className="px-3 py-2">{n.level}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={commissionAmount}
                      onChange={(e) => setCommissionAmount(e.target.value)}
                      placeholder="Commission amount"
                      className="w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white"
                    />
                    <select
                      value={commissionAction}
                      onChange={(e) => setCommissionAction(e.target.value as any)}
                      className="w-full rounded-xl border border-white/10 bg-[#070b11] px-4 py-3 text-sm text-white"
                    >
                      <option value="add">Add</option>
                      <option value="deduct">Deduct</option>
                      <option value="set">Set</option>
                    </select>
                    <div className="col-span-2 flex gap-2">
                      <Button onClick={() => handleUpdateCommission(selectedTreeUserId)} className="bg-primary" disabled={commissionLoading}>
                        {commissionLoading ? 'Applying...' : 'Apply'}
                      </Button>
                      <Button onClick={closeUserTree} className="bg-white/5">Close</Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-6 text-foreground/60">No downline data available.</div>
              )}
            </div>
          </div>
        )}
      </div>
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#02040a]/95 backdrop-blur-xl py-2 md:hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 px-4">
            <button
              onClick={() => setActiveTab('registrations')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition ${activeTab === 'registrations' ? 'bg-white/10 text-white' : 'bg-white/5 text-foreground/70'}`}
              aria-label="Registrations"
            >
              <Users className="h-5 w-5" />
              <span className="text-[10px]">Regs</span>
            </button>
            <button
              onClick={() => { setActiveTab('site'); fetchSiteSettings(); }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition ${activeTab === 'site' ? 'bg-white/10 text-white' : 'bg-white/5 text-foreground/70'}`}
              aria-label="Site Settings"
            >
              <Shield className="h-5 w-5" />
              <span className="text-[10px]">Site</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition ${activeTab === 'users' ? 'bg-white/10 text-white' : 'bg-white/5 text-foreground/70'}`}
              aria-label="Users"
            >
              <Search className="h-5 w-5" />
              <span className="text-[10px]">Users</span>
            </button>
            <button
              onClick={() => { setActiveTab('recharges'); fetchRechargeRequests() }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition ${activeTab === 'recharges' ? 'bg-white/10 text-white' : 'bg-white/5 text-foreground/70'}`}
              aria-label="Recharge Requests"
            >
              <DollarSign className="h-5 w-5" />
              <span className="text-[10px]">Topup</span>
            </button>
            <button
              onClick={() => { setActiveTab('assistant'); fetchQaEntries() }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition ${activeTab === 'assistant' ? 'bg-white/10 text-white' : 'bg-white/5 text-foreground/70'}`}
              aria-label="Assistant"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-[10px]">AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
