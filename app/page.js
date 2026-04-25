'use client';
import { useEffect, useRef } from 'react';

export default function Home() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const move = (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };
    document.addEventListener('mousemove', move);
    const els = document.querySelectorAll('a, button');
    els.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
    return () => document.removeEventListener('mousemove', move);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;1,300&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,200;1,9..144,400&display=swap');

        :root {
          --cream: #f4f0e6;
          --warm-white: #faf8f2;
          --earth: #2c2416;
          --clay: #7a5c3a;
          --moss: #4a5c3a;
          --gold: #c8a96e;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        body {
          background: var(--warm-white);
          color: var(--earth);
          font-family: 'DM Mono', monospace;
          overflow-x: hidden;
          cursor: none;
        }

        .cursor {
          width: 12px; height: 12px;
          border: 1.5px solid var(--clay);
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.15s ease, background 0.15s ease;
          transform: translate(-50%, -50%);
        }
        .cursor.hover { transform: translate(-50%, -50%) scale(2.5); background: rgba(200,169,110,0.12); }

        .bubbles-bg {
          position: fixed; inset: 0;
          pointer-events: none; z-index: 0; overflow: hidden;
        }
        .bubble {
          position: absolute; border-radius: 50%; border: 1px solid;
          animation: floatUp linear infinite; opacity: 0;
        }
        @keyframes floatUp {
          0%   { transform: translateY(100vh) scale(0.5); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-20vh) scale(1); opacity: 0; }
        }
        .bubble:nth-child(1)  { width:18px;height:18px;left:8%;  border-color:var(--gold); animation-duration:14s;animation-delay:0s; }
        .bubble:nth-child(2)  { width:10px;height:10px;left:20%; border-color:var(--moss); animation-duration:18s;animation-delay:3s; }
        .bubble:nth-child(3)  { width:24px;height:24px;left:35%; border-color:var(--clay); animation-duration:12s;animation-delay:1s; }
        .bubble:nth-child(4)  { width:8px; height:8px; left:50%; border-color:var(--gold); animation-duration:20s;animation-delay:6s; }
        .bubble:nth-child(5)  { width:16px;height:16px;left:65%; border-color:var(--moss); animation-duration:15s;animation-delay:2s; }
        .bubble:nth-child(6)  { width:12px;height:12px;left:78%; border-color:var(--clay); animation-duration:17s;animation-delay:8s; }
        .bubble:nth-child(7)  { width:20px;height:20px;left:90%; border-color:var(--gold); animation-duration:13s;animation-delay:4s; }
        .bubble:nth-child(8)  { width:6px; height:6px; left:45%; border-color:var(--clay); animation-duration:22s;animation-delay:10s; }
        .bubble:nth-child(9)  { width:14px;height:14px;left:15%; border-color:var(--gold); animation-duration:16s;animation-delay:7s; }
        .bubble:nth-child(10) { width:9px; height:9px; left:58%; border-color:var(--moss); animation-duration:19s;animation-delay:5s; }

        nav {
          position: fixed; top:0; left:0; right:0; z-index:100;
          padding: 24px 48px;
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(250,248,242,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(44,36,22,0.06);
        }
        .nav-logo { display:flex; align-items:center; gap:14px; text-decoration:none; }
        .nav-symbol {
          width:32px;height:32px;
          border:1.5px solid var(--earth); border-radius:50%;
          display:flex; align-items:center; justify-content:center; position:relative;
        }
        .nav-symbol::after {
          content:''; width:22px;height:22px;
          border:1px dashed var(--earth); border-radius:50%;
          position:absolute; opacity:0.25;
        }
        .nav-dot { width:5px;height:5px;background:var(--earth);border-radius:50%; }
        .nav-wordmark { font-family:'DM Mono',monospace;font-size:14px;letter-spacing:3px;text-transform:uppercase;color:var(--earth); }
        .nav-links { display:flex;gap:36px;list-style:none; }
        .nav-links a { font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--clay);text-decoration:none;transition:color 0.2s; }
        .nav-links a:hover { color:var(--earth); }

        .hero {
          min-height:100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          position:relative; z-index:1; padding:120px 48px 80px; text-align:center;
        }
        .hero-eyebrow { font-size:9px;letter-spacing:5px;text-transform:uppercase;color:var(--gold);margin-bottom:32px;animation:fadeUp 0.8s ease both; }
        .hero-title {
          font-family:'Fraunces',serif; font-size:clamp(52px,10vw,96px);
          font-weight:200; font-style:italic; color:var(--earth);
          line-height:1.05; letter-spacing:-1px; margin-bottom:24px;
          animation:fadeUp 0.8s ease 0.15s both;
        }
        .hero-title span { color:var(--gold);font-style:normal;font-weight:600; }
        .hero-sub { font-size:11px;letter-spacing:2px;color:var(--clay);line-height:2;max-width:480px;animation:fadeUp 0.8s ease 0.3s both; }
        .hero-divider { width:1px;height:60px;background:linear-gradient(to bottom,var(--gold),transparent);margin:48px auto 0;animation:fadeUp 0.8s ease 0.45s both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        section { position:relative;z-index:1;padding:100px 48px;max-width:1100px;margin:0 auto; }
        .section-label {
          font-size:9px;letter-spacing:5px;text-transform:uppercase;color:var(--gold);
          margin-bottom:48px;display:flex;align-items:center;gap:16px;
        }
        .section-label::after { content:'';flex:1;height:1px;background:linear-gradient(to right,rgba(200,169,110,0.3),transparent);max-width:120px; }

        .about-grid { display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center; }
        .about-text { font-family:'Fraunces',serif;font-size:clamp(22px,3vw,32px);font-weight:300;line-height:1.6;color:var(--earth); }
        .about-text em { color:var(--gold);font-style:italic; }
        .about-meta { display:flex;flex-direction:column;gap:32px; }
        .meta-item { border-left:1px solid rgba(200,169,110,0.3);padding-left:24px; }
        .meta-item h4 { font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:8px; }
        .meta-item p { font-size:12px;line-height:1.8;color:var(--clay); }

        .blog-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:2px; }
        .blog-card {
          background:var(--cream);padding:40px 32px;position:relative;
          overflow:hidden;transition:background 0.3s;text-decoration:none;display:block;
        }
        .blog-card:hover { background:#ede8d8; }
        .blog-card::before { content:'';position:absolute;top:20px;right:20px;width:40px;height:40px;border:1px solid rgba(200,169,110,0.3);border-radius:50%; }
        .blog-card::after { content:'';position:absolute;top:28px;right:28px;width:24px;height:24px;border:1px dashed rgba(200,169,110,0.2);border-radius:50%; }
        .blog-date { font-size:9px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:16px; }
        .blog-title { font-family:'Fraunces',serif;font-size:20px;font-weight:300;font-style:italic;color:var(--earth);line-height:1.4;margin-bottom:16px; }
        .blog-excerpt { font-size:10px;line-height:1.9;color:var(--clay); }
        .blog-arrow { display:inline-block;margin-top:24px;font-size:9px;letter-spacing:3px;color:var(--gold);text-transform:uppercase; }

        footer {
          position:relative;z-index:1;
          border-top:1px solid rgba(44,36,22,0.08);
          padding:60px 48px;display:flex;justify-content:space-between;align-items:center;
        }
        .footer-logo { font-family:'DM Mono',monospace;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--clay); }
        .footer-links { display:flex;gap:32px;list-style:none; }
        .footer-links a { font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--clay);text-decoration:none;opacity:0.6;transition:opacity 0.2s; }
        .footer-links a:hover { opacity:1; }
        .footer-copy { font-size:9px;letter-spacing:2px;color:var(--clay);opacity:0.4; }
      `}</style>

      <div ref={cursorRef} className="cursor" />

      <div className="bubbles-bg">
        {[...Array(10)].map((_, i) => <div key={i} className="bubble" />)}
      </div>

      <nav>
        <a href="#" className="nav-logo">
          <div className="nav-symbol"><div className="nav-dot" /></div>
          <span className="nav-wordmark">Fermental</span>
        </a>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <div className="hero">
        <p className="hero-eyebrow">Culture · Craft · Curiosity</p>
        <h1 className="hero-title">
          A space for<br /><span>fermentation</span><br />& everything it<br />stirs up
        </h1>
        <p className="hero-sub">Recipes, learning, products, and a community of people who find something alive in the process.</p>
        <div className="hero-divider" />
      </div>

      <section id="about">
        <p className="section-label">About</p>
        <div className="about-grid">
          <div className="about-text">
            Fermental is a living space — still <em>bubbling</em>, still finding its shape. Products, recipes, learning, and like-minded people who find something alive in the process.
          </div>
          <div className="about-meta">
            <div className="meta-item">
              <h4>What you'll find</h4>
              <p>Recipes that work. Things I'm figuring out. Products worth sharing. Honest exploration.</p>
            </div>
            <div className="meta-item">
              <h4>Who it's for</h4>
              <p>Anyone curious about fermentation — beginner or obsessed. You belong here.</p>
            </div>
            <div className="meta-item">
              <h4>Where it's going</h4>
              <p>Still fermenting. Check back often.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="blog">
        <p className="section-label">Latest</p>
        <div className="blog-grid">
          {[
            { date: 'Apr 2026', title: 'Why everything I make starts with salt', excerpt: 'Salt isn\'t just preservation. It\'s the first decision — the one that sets everything else in motion.' },
            { date: 'Apr 2026', title: 'The batch that taught me patience', excerpt: 'Three weeks of waiting for something I almost threw away on day five. Here\'s what happened.' },
            { date: 'Mar 2026', title: 'Kimchi variations nobody talks about', excerpt: 'Beyond the classic. Regional takes, ingredient swaps, and what actually changes the flavour.' },
          ].map((post, i) => (
            <a key={i} href="/blog" className="blog-card">
              <p className="blog-date">{post.date}</p>
              <h3 className="blog-title">{post.title}</h3>
              <p className="blog-excerpt">{post.excerpt}</p>
              <span className="blog-arrow">Read →</span>
            </a>
          ))}
        </div>
      </section>

      <footer id="contact">
        <div className="footer-logo">Fermental</div>
        <ul className="footer-links">
          <li><a href="#">Substack</a></li>
          <li><a href="#">Instagram</a></li>
          <li><a href="#">Reddit</a></li>
          <li><a href="#">YouTube</a></li>
        </ul>
        <p className="footer-copy">© 2026 Fermental</p>
      </footer>
    </>
  );
}