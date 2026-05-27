export type AdminWalletCurrency = 'INR' | 'USDT' | 'EUR'

const adminWalletBalances: Record<string, number> = {
  INR: 0,
  USDT: 0,
  EUR: 0,
}

const adminWalletLedger: any[] = []

export function getAdminWalletBalances() {
  return {
    balances: { ...adminWalletBalances },
    ledger: [...adminWalletLedger],
  }
}

export function depositToAdminWallet(amount: number, currency: AdminWalletCurrency, note = 'Admin wallet deposit') {
  const normalizedCurrency = currency.toUpperCase() as AdminWalletCurrency
  adminWalletBalances[normalizedCurrency] = (adminWalletBalances[normalizedCurrency] || 0) + amount
  adminWalletLedger.unshift({
    id: Date.now().toString(),
    type: 'deposit',
    amount,
    currency: normalizedCurrency,
    note,
    date: new Date().toISOString(),
  })

  return getAdminWalletBalances()
}

export function transferFromAdminWallet(amount: number, currency: AdminWalletCurrency, targetUserId: string, note = 'Admin wallet transfer') {
  const normalizedCurrency = currency.toUpperCase() as AdminWalletCurrency
  const available = adminWalletBalances[normalizedCurrency] || 0

  if (available < amount) {
    return {
      success: false,
      available,
      balances: getAdminWalletBalances(),
    }
  }

  adminWalletBalances[normalizedCurrency] = available - amount
  adminWalletLedger.unshift({
    id: Date.now().toString(),
    type: 'transfer',
    amount,
    currency: normalizedCurrency,
    targetUserId,
    note,
    date: new Date().toISOString(),
  })

  return {
    success: true,
    balances: getAdminWalletBalances(),
  }
}
