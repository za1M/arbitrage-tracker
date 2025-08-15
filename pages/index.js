import { useEffect, useState } from 'react';

export default function Home() {
  const [prices, setPrices] = useState([]);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchPrices() {
    try {
      const res = await fetch('/api/prices');
      if (!res.ok) throw new Error('Failed to fetch prices');
      const data = await res.json();

      const priceMap = {};

      data.forEach((entry) => {
        const symbol = entry.symbol.toUpperCase();
        if (!priceMap[symbol]) {
          priceMap[symbol] = { symbol, binance: null, okx: null };
        }

        if (entry.exchange === 'Binance') {
          priceMap[symbol].binance = entry.price;
        } else if (entry.exchange === 'OKX') {
          priceMap[symbol].okx = entry.price;
        }
      });

      const combinedPrices = Object.values(priceMap);
      setPrices(combinedPrices);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  function calculateArbitrage(binance, okx) {
    if (!binance || !okx) return null;
    const diff = Math.abs(binance - okx);
    const percent = (diff / Math.min(binance, okx)) * 100;
    return percent;
  }

  function toggleSortOrder() {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  }

  const sortedPrices = [...prices]
    .sort((a, b) => {
      const arbA = calculateArbitrage(a.binance, a.okx) ?? -1;
      const arbB = calculateArbitrage(b.binance, b.okx) ?? -1;
      return sortOrder === 'asc' ? arbA - arbB : arbB - arbA;
    });

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>CEX Arbitrage Table</h1>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={thStyle}>Coin</th>
            <th style={thStyle}>Binance</th>
            <th style={thStyle}>OKX</th>
            <th style={{ ...thStyle, cursor: 'pointer' }} onClick={toggleSortOrder}>
              Arbitrage %
              {sortOrder === 'asc' ? ' 🔼' : ' 🔽'}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedPrices.map(({ symbol, binance, okx }) => {
            const arbitrage = calculateArbitrage(binance, okx);
            return (
              <tr key={symbol}>
                <td style={tdStyle}>{symbol}</td>
                <td style={tdStyle}>{binance ? binance.toFixed(4) : ''}</td>
                <td style={tdStyle}>{okx ? okx.toFixed(4) : ''}</td>
                <td style={{ ...tdStyle, color: arbitrage ? 'green' : '#999' }}>
                  {arbitrage !== null ? arbitrage.toFixed(2) + ' %' : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: '10px',
  border: '1px solid #ccc',
  textAlign: 'center',
  fontWeight: 'bold',
};

const tdStyle = {
  padding: '8px',
  border: '1px solid #ddd',
  textAlign: 'center',
};
