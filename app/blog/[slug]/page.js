import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import Link from 'next/link';

export async function generateStaticParams() {
  const files = fs.readdirSync(path.join(process.cwd(), 'posts'));
  return files.filter(f => f.endsWith('.md')).map(f => ({ slug: f.replace('.md', '') }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const raw = fs.readFileSync(path.join(process.cwd(), 'posts', `${slug}.md`), 'utf8');
  const { data } = matter(raw);
  return { title: `${data.title} — Fermental`, description: data.excerpt };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const raw = fs.readFileSync(path.join(process.cwd(), 'posts', `${slug}.md`), 'utf8');
  const { data, content } = matter(raw);
  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,200;1,9..144,400&display=swap');
        :root {
          --cream: #f4f0e6;
          --warm-white: #faf8f2;
          --earth: #2c2416;
          --clay: #7a5c3a;
          --gold: #c8a96e;
        }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background: var(--warm-white); font-family: 'DM Mono', monospace; color: var(--earth); }
        nav {
          padding: 24px 48px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid rgba(44,36,22,0.06);
        }
        .nav-logo { display:flex; align-items:center; gap:14px; text-decoration:none; }
        .nav-symbol { width:32px;height:32px;border:1.5px solid var(--earth);border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative; }
        .nav-symbol::after { content:'';width:22px;height:22px;border:1px dashed var(--earth);border-radius:50%;position:absolute;opacity:0.25; }
        .nav-dot { width:5px;height:5px;background:var(--earth);border-radius:50%; }
        .nav-wordmark { font-size:14px;letter-spacing:3px;text-transform:uppercase;color:var(--earth); }
        .nav-links { display:flex;gap:36px;list-style:none; }
        .nav-links a { font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--clay);text-decoration:none; }
        .container { max-width:720px;margin:0 auto;padding:80px 48px; }
        .back { font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);text-decoration:none;display:inline-block;margin-bottom:48px; }
        .post-date { font-size:9px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:16px; }
        .post-title { font-family:'Fraunces',serif;font-size:clamp(32px,5vw,52px);font-weight:300;font-style:italic;line-height:1.2;margin-bottom:48px;padding-bottom:48px;border-bottom:1px solid rgba(200,169,110,0.2); }
        .post-content { font-size:13px;line-height:2.2;color:var(--clay); }
        .post-content p { margin-bottom:24px; }
        .post-content h2 { font-family:'Fraunces',serif;font-size:24px;font-weight:300;font-style:italic;color:var(--earth);margin:48px 0 16px; }
        .post-content h3 { font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin:32px 0 12px; }
      `}</style>

      <nav>
        <Link href="/" className="nav-logo">
          <div className="nav-symbol"><div className="nav-dot" /></div>
          <span className="nav-wordmark">Fermental</span>
        </Link>
        <ul className="nav-links">
          <li><Link href="/#about">About</Link></li>
          <li><Link href="/blog">Blog</Link></li>
        </ul>
      </nav>

      <div className="container">
        <Link href="/blog" className="back">← All Posts</Link>
        <p className="post-date">{data.date}</p>
        <h1 className="post-title">{data.title}</h1>
        <div className="post-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>
    </>
  );
}