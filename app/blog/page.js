import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

export const metadata = {
  title: 'Blog — Fermental',
  description: 'Recipes, thoughts, and fermentation explorations.',
};

export default function BlogPage() {
  const postsDir = path.join(process.cwd(), 'posts');
  const files = fs.readdirSync(postsDir);

  const posts = files
    .filter(f => f.endsWith('.md'))
    .map(filename => {
      const raw = fs.readFileSync(path.join(postsDir, filename), 'utf8');
      const { data } = matter(raw);
      return {
        slug: filename.replace('.md', ''),
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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
        .container { max-width:1100px;margin:0 auto;padding:80px 48px; }
        .page-title { font-family:'Fraunces',serif;font-size:48px;font-weight:200;font-style:italic;margin-bottom:8px; }
        .page-sub { font-size:10px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:64px; }
        .posts-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:2px; }
        .post-card { background:var(--cream);padding:40px 32px;text-decoration:none;display:block;position:relative;overflow:hidden;transition:background 0.3s; }
        .post-card:hover { background:#ede8d8; }
        .post-card::before { content:'';position:absolute;top:20px;right:20px;width:40px;height:40px;border:1px solid rgba(200,169,110,0.3);border-radius:50%; }
        .post-date { font-size:9px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:16px; }
        .post-title { font-family:'Fraunces',serif;font-size:20px;font-weight:300;font-style:italic;color:var(--earth);line-height:1.4;margin-bottom:12px; }
        .post-excerpt { font-size:10px;line-height:1.9;color:var(--clay); }
        .post-arrow { display:inline-block;margin-top:24px;font-size:9px;letter-spacing:3px;color:var(--gold);text-transform:uppercase; }
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
        <h1 className="page-title">All Posts</h1>
        <p className="page-sub">Fermentation · Recipes · Curiosity</p>
        <div className="posts-grid">
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="post-card">
              <p className="post-date">{post.date}</p>
              <h2 className="post-title">{post.title}</h2>
              <p className="post-excerpt">{post.excerpt}</p>
              <span className="post-arrow">Read →</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}