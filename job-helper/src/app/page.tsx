'use client';
import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setResult(null);
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDescription: text }),
    });
    const json = await res.json();
    setResult(json);
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: 16 }}>
      <h1 style={{ fontWeight: 700, fontSize: 24, marginBottom: 16 }}>
        AI Job Search Helper (POC)
      </h1>

      <textarea
        style={{ width: '100%', height: 200, padding: 12, marginBottom: 12 }}
        placeholder="Paste a job description here… and get some data back!"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={analyze}
        disabled={loading || !text.trim()}
        style={{
          padding: '8px 14px',
          background: '#111',
          color: '#fff',
          borderRadius: 6,
          opacity: loading || !text.trim() ? 0.6 : 1,
        }}
      >
        {loading ? 'Analyzing... Thinking....' : 'Analyze'}
      </button>

      {result && !result.error && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            Match Score: <strong>{result.score}%</strong>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>These are your matched skills:</div>
            <ul>
              {result.matched?.map((m: any) => (
                <li key={m.id}>{m.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Possible Gaps & not doing well here:</div>
            <ul>
              {result.gaps?.map((g: string, i: number) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {result?.error && (
        <div style={{ marginTop: 16, color: '#c00' }}>
          Error: {result.error}
        </div>
      )}
    </main>
  );
}
