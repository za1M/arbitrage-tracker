import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data, error } = useSWR('/api/prices', fetcher, { refreshInterval: 5000 });

  if (error) return <div>Lỗi tải dữ liệu...</div>;
  if (!data) return <div>Đang tải...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Arbitrage Watcher (Crypto + Forex)</h1>
      <h2>Crypto Prices</h2>
      <ul>
        {data.cryptos.map(c => (
          <li key={c.name}>{c.name}: ${c.price} (Phí: {(c.fee*100).toFixed(2)}%)</li>
        ))}
      </ul>
      <h2>Forex Rates (USD → EUR, JPY)</h2>
      <pre>{JSON.stringify(data.rates, null, 2)}</pre>
      <h2>Cơ hội Arbitrage</h2>
      {data.opportunities.length > 0
        ? data.opportunities.map((opp, i) => <div key={i} style={{ color: 'green' }}>{opp}</div>)
        : <div>Không có cơ hội hiện tại</div>}
    </div>
  );
}
