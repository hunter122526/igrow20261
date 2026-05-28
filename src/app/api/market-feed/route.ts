import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,cardano,ripple,cronos&order=market_cap_desc&per_page=6&page=1&price_change_percentage=24h'
const COINMARKETCAP_SYMBOLS = 'BTC,ETH,SOL,ADA,XRP,CRO'
const COINMARKETCAP_URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${COINMARKETCAP_SYMBOLS}&convert=USD`
const CRYPTOCOMPARE_SYMBOLS = 'BTC,ETH,SOL,ADA,XRP,CRO'
const CRYPTOCOMPARE_URL = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${CRYPTOCOMPARE_SYMBOLS}&tsyms=USD`
const SYMBOL_TO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  ADA: 'cardano',
  XRP: 'ripple',
  CRO: 'cronos',
}

async function fetchCoinGecko() {
  const response = await fetch(COINGECKO_URL, { cache: 'no-store' })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(`CoinGecko error: ${message}`)
  }

  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new Error('Unexpected CoinGecko response format')
  }

  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    symbol: item.symbol.toUpperCase(),
    price: item.current_price ?? 0,
    change: item.price_change_percentage_24h_in_currency ?? 0,
    marketCap: item.market_cap ? `${Math.round(item.market_cap / 1e9)}B` : '-',
    volume: item.total_volume ? `${Math.round(item.total_volume / 1e9)}B` : '-',
    image: item.image || '',
    lastUpdated: item.last_updated || '',
  }))
}

async function fetchCoinMarketCap(apiKey: string) {
  const response = await fetch(COINMARKETCAP_URL, {
    cache: 'no-store',
    headers: {
      'X-CMC_PRO_API_KEY': apiKey,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`CoinMarketCap error: ${message}`)
  }

  const payload = await response.json()
  if (!payload?.data || typeof payload.data !== 'object') {
    throw new Error('Unexpected CoinMarketCap response format')
  }

  return Object.entries(payload.data).map(([symbol, item]: [string, any]) => {
    const quote = item?.quote?.USD || {}
    return {
      id: SYMBOL_TO_ID[symbol] || symbol.toLowerCase(),
      name: item.name || symbol,
      symbol: symbol.toUpperCase(),
      price: quote.price ?? 0,
      change: quote.percent_change_24h ?? 0,
      marketCap: quote.market_cap ? `${Math.round(quote.market_cap / 1e9)}B` : '-',
      volume: quote.volume_24h ? `${Math.round(quote.volume_24h / 1e9)}B` : '-',
      image: '',
      lastUpdated: item.last_updated || '',
    }
  })
}

async function fetchCryptoCompare(apiKey: string) {
  const response = await fetch(CRYPTOCOMPARE_URL, {
    cache: 'no-store',
    headers: {
      Apikey: apiKey,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`CryptoCompare error: ${message}`)
  }

  const payload = await response.json()
  if (!payload?.RAW || typeof payload.RAW !== 'object') {
    throw new Error('Unexpected CryptoCompare response format')
  }

  return Object.entries(payload.RAW).map(([symbol, quoteData]: [string, any]) => {
    const quote = quoteData?.USD || {}
    return {
      id: SYMBOL_TO_ID[symbol] || symbol.toLowerCase(),
      name: quote.FROMSYMBOL || symbol,
      symbol: symbol.toUpperCase(),
      price: quote.PRICE ?? 0,
      change: quote.CHANGEPCT24HOUR ?? 0,
      marketCap: typeof quote.MKTCAP === 'number' ? `${Math.round(quote.MKTCAP / 1e9)}B` : '-',
      volume: typeof quote.VOLUME24HOURTO === 'number' ? `${Math.round(quote.VOLUME24HOURTO / 1e9)}B` : '-',
      image: quote.IMAGEURL ? `https://www.cryptocompare.com${quote.IMAGEURL}` : '',
      lastUpdated: typeof quote.LASTUPDATE === 'number' ? new Date(quote.LASTUPDATE * 1000).toISOString() : '',
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const coinMarketCapKey = process.env.COINMARKETCAP_API_KEY || ''
    const cryptoCompareKey = process.env.MARKET_FEED_API_KEY || ''
    let coins

    if (coinMarketCapKey) {
      try {
        coins = await fetchCoinMarketCap(coinMarketCapKey)
      } catch (error) {
        console.warn('CoinMarketCap fallback:', String(error))
      }
    }

    if ((!coins || coins.length === 0) && cryptoCompareKey) {
      try {
        coins = await fetchCryptoCompare(cryptoCompareKey)
      } catch (error) {
        console.warn('CryptoCompare fallback:', String(error))
      }
    }

    if (!coins || coins.length === 0) {
      coins = await fetchCoinGecko()
    }

    return NextResponse.json({ coins })
  } catch (error) {
    return NextResponse.json({ error: 'Unable to load market feed', message: String(error) }, { status: 500 })
  }
}
