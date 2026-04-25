'use client';
import { useState, useRef } from 'react';

export default function Studio() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [touchLevel, setTouchLevel] = useState('light');
  const [seconds, setSeconds] = useState(0);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const timer = useRef(null);

  const startRecording = async () => {
    setResult(null);
    setError(null);
    setSeconds(0);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    chunks.current = [];
    mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data);
    mediaRecorder.current.onstop = handleStop;
    mediaRecorder.current.start();
    setRecording(true);
    timer.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
    clearInterval(timer.current);
    setRecording(false);
    setProcessing(true);
  };

  const handleStop = async () => {
    const blob = new Blob(chunks.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');
    formData.append('touchLevel', touchLevel);

    try {
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = s => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400&family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,200&display=swap');
        :root {
          --cream: #f4f0e6;
          --warm-white: #faf8f2;
          --earth: #2c2416;
          --clay: #7a5c3a;
          --gold: #c8a96e;
          --moss: #4a5c3a;
        }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background: var(--warm-white); font-family: 'DM Mono', monospace; color: var(--earth); min-height: 100vh; }
        nav { padding: 24px 48px; display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(44,36,22,0.06); }
        .nav-logo { display:flex; align-items:center; gap:14px; text-decoration:none; }
        .nav-symbol { width:32px;height:32px;border:1.5px solid var(--earth);border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative; }
        .nav-symbol::after { content:'';width:22px;height:22px;border:1px dashed var(--earth);border-radius:50%;position:absolute;opacity:0.25; }
        .nav-dot { width:5px;height:5px;background:var(--earth);border-radius:50%; }
        .nav-wordmark { font-size:14px;letter-spacing:3px;text-transform:uppercase;color:var(--earth); }

        .container { max-width: 680px; margin: 0 auto; padding: 80px 48px; }
        .page-title { font-family:'Fraunces',serif; font-size:40px; font-weight:200; font-style:italic; margin-bottom:8px; }
        .page-sub { font-size:9px; letter-spacing:4px; text-transform:uppercase; color:var(--gold); margin-bottom:64px; }

        .touch-selector { display:flex; gap:2px; margin-bottom:48px; }
        .touch-btn {
          flex:1; padding:12px; font-family:'DM Mono',monospace; font-size:9px;
          letter-spacing:3px; text-transform:uppercase; border:1px solid rgba(44,36,22,0.15);
          background:transparent; color:var(--clay); cursor:pointer; transition:all 0.2s;
        }
        .touch-btn.active { background:var(--earth); color:var(--warm-white); border-color:var(--earth); }

        .record-area { display:flex; flex-direction:column; align-items:center; gap:32px; padding:64px 0; }

        .record-btn {
          width:120px; height:120px; border-radius:50%;
          border:2px solid var(--earth); background:transparent;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.3s; position:relative;
        }
        .record-btn:hover { background:var(--cream); }
        .record-btn.recording { border-color:#c0392b; animation: pulse 1.5s ease infinite; }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(192,57,43,0.3); }
          50% { box-shadow: 0 0 0 20px rgba(192,57,43,0); }
        }
        .record-dot { width:32px; height:32px; border-radius:50%; background:var(--earth); transition:all 0.3s; }
        .record-dot.recording { background:#c0392b; border-radius:6px; width:24px; height:24px; }

        .timer { font-size:32px; letter-spacing:4px; color:var(--clay); font-weight:300; }
        .record-label { font-size:9px; letter-spacing:4px; text-transform:uppercase; color:var(--gold); }

        .processing { text-align:center; padding:48px 0; }
        .processing-text { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:var(--clay); }
        .spinner { width:40px;height:40px;border:1px solid var(--cream);border-top-color:var(--gold);border-radius:50%;animation:spin 1s linear infinite;margin:24px auto; }
        @keyframes spin { to { transform:rotate(360deg); } }

        .result { border:1px solid rgba(200,169,110,0.2); padding:40px; margin-top:48px; }
        .result-label { font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:8px; }
        .result-title { font-family:'Fraunces',serif;font-size:24px;font-weight:300;font-style:italic;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid rgba(200,169,110,0.2); }
        .result-text { font-size:12px;line-height:2;color:var(--clay);margin-bottom:32px; }
        .result-actions { display:flex;gap:12px; }
        .btn-primary { padding:12px 32px;background:var(--earth);color:var(--warm-white);border:none;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;cursor:pointer;text-decoration:none;display:inline-block; }
        .btn-secondary { padding:12px 32px;background:transparent;color:var(--clay);border:1px solid rgba(44,36,22,0.2);font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;cursor:pointer; }

        .error { background:#fff5f5;border:1px solid #c0392b;padding:24px;color:#c0392b;font-size:11px;margin-top:32px; }
      `}</style>

      <nav>
        <a href="/" className="nav-logo">
          <div className="nav-symbol"><div className="nav-dot" /></div>
          <span className="nav-wordmark">Fermental</span>
        </a>
      </nav>

      <div className="container">
        <h1 className="page-title">Voice Studio</h1>
        <p className="page-sub">Speak · Publish · Done</p>

        <div className="touch-selector">
          {['minimal', 'light'].map(level => (
            <button key={level} className={`touch-btn ${touchLevel === level ? 'active' : ''}`} onClick={() => setTouchLevel(level)}>
              {level === 'minimal' ? '🟢 Minimal — punctuation only' : '🟡 Light — remove fillers'}
            </button>
          ))}
        </div>

        {!processing && !result && (
          <div className="record-area">
            <button className={`record-btn ${recording ? 'recording' : ''}`} onClick={recording ? stopRecording : startRecording}>
              <div className={`record-dot ${recording ? 'recording' : ''}`} />
            </button>
            {recording && <div className="timer">{formatTime(seconds)}</div>}
            <p className="record-label">{recording ? 'Tap to stop' : 'Tap to record'}</p>
          </div>
        )}

        {processing && (
          <div className="processing">
            <div className="spinner" />
            <p className="processing-text">Transcribing → Formatting → Saving...</p>
          </div>
        )}

        {error && <div className="error">Error: {error}</div>}

        {result && (
          <div className="result">
            <p className="result-label">Ready to publish</p>
            <h2 className="result-title">{result.title}</h2>
            <p className="result-text">{result.formatted}</p>
            <div className="result-actions">
              <a href={`/blog/${result.slug}`} className="btn-primary">View Post →</a>
              <button className="btn-secondary" onClick={() => { setResult(null); setSeconds(0); }}>Record Another</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}