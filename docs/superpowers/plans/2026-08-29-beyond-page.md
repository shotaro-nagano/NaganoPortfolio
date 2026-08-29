# Beyond Work 別ページ化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** index.html の Beyond Work セクションを専用ページ `beyond.html` に分離し、YouTube 埋め込み + 拡充した説明でリッチ化。index はナビから「その他」を消しフッターリンクのみに。

**Architecture:** 静的サイト(ビルドなし)。`beyond.html` は既存の `css/styles.css` / `js/i18n.js` / `js/main.js` をそのまま読み込み、テーマ・言語・アニメーションを共有。Three.js(`hero.js`)とプリローダーは載せない。main.js は全初期化が要素存在ガード付きなのでほぼ無変更(ヒーロー用 GSAP セレクタ 2 箇所のみガード追加)。

**Tech Stack:** HTML / CSS / Vanilla JS、GSAP + ScrollTrigger + Lenis + SplitType(CDN)、YouTube iframe 埋め込み(`youtube-nocookie.com`)。

**確定済みの値:**

- Lofi Space チャンネル ID: `UC2ZDLk_oaVtE51Ydk4Xv2DA` → アップロード一覧プレイリスト `UU2ZDLk_oaVtE51Ydk4Xv2DA`(HTTP 200 確認済み)
- カードゲーム CH: `UCzzdKQyJhgm0ciD7rwtCY6w` → `UUzzdKQyJhgm0ciD7rwtCY6w`(HTTP 200 確認済み)
- 埋め込み URL 形式: `https://www.youtube-nocookie.com/embed/videoseries?list=<UU...>`

**テストについて:** テストフレームワークはない(手動確認が既存の流儀)。各タスクの検証は `python -m http.server 8000` + curl + ブラウザ確認(webapp-testing スキルの Playwright 推奨)。サーバーはタスク間で立てっぱなしで良い。

---

### Task 1: i18n.js — 新ページ用キーの追加

**Files:**
- Modify: `js/i18n.js`(JA の beyond ブロックは 69〜82 行付近、EN は 157〜170 行付近、footer キーは contact キー群の近く)

- [ ] **Step 1: JA の beyond キー群を差し替え**

`js/i18n.js` の JA 側 `"beyond.eyebrow"` 〜 `"beyond.b3link"` のブロックを以下に置き換える(既存キーは維持、`back` / `backlong` / `lead` / `b*p2` を追加):

```js
    "beyond.eyebrow": "Beyond Work",
    "beyond.title": "<span class='nb'>仕事の外で、</span><span class='nb'>つくっているもの。</span>",
    "beyond.back": "← ポートフォリオ",
    "beyond.backlong": "← ポートフォリオへ戻る",
    "beyond.lead": "エンジニアの仕事から離れた場所でも、手を動かしてつくり続けています。写真、音楽、映像 — 3つの活動を紹介します。",
    "beyond.b1k": "写真 / Instagram",
    "beyond.b1t": "@nyagagram",
    "beyond.b1d": "GR で撮りためた写真を発信。専用の紹介サイトも自作しました。",
    "beyond.b1p2": "RICOH GR をポケットに入れて、街の光と影、ふとした瞬間を切り取っています。撮影から現像、紹介サイトの制作まで、すべて自分の手で。",
    "beyond.b1link": "Instagram を開く",
    "beyond.b2k": "AI 音楽・映像",
    "beyond.b2t": "Lofi Space",
    "beyond.b2d": "生成AIを使った Lofi の音楽・映像制作。健全なコンテンツのみを発信しています。",
    "beyond.b2p2": "作曲も映像もサムネイルも、生成AIツールを組み合わせて一人で制作。ツールの選び方や品質の整え方は、仕事での AI 活用にもそのまま活きています。",
    "beyond.b2link": "チャンネルを開く",
    "beyond.b3k": "YouTube",
    "beyond.b3t": "カードゲーム",
    "beyond.b3d": "カードゲームをテーマにした動画を制作・投稿しています。",
    "beyond.b3p2": "企画から撮影・編集・配信まで一人で担当。ライブ配信やパック開封など、視聴者と一緒に楽しめる動画づくりを目指しています。",
    "beyond.b3link": "チャンネルを開く",
```

- [ ] **Step 2: JA に footer.beyond を追加**

JA 側 `"contact.rights"` の行の直後に追加:

```js
    "footer.beyond": "仕事の外でつくっているもの",
```

- [ ] **Step 3: EN の beyond キー群を差し替え**

EN 側 `"beyond.eyebrow"` 〜 `"beyond.b3link"` のブロックを以下に置き換える:

```js
    "beyond.eyebrow": "Beyond Work",
    "beyond.title": "What I make outside the job.",
    "beyond.back": "← Portfolio",
    "beyond.backlong": "← Back to portfolio",
    "beyond.lead": "Away from engineering work, I keep making things with my own hands. Photography, music and video — here are three of them.",
    "beyond.b1k": "Photography / Instagram",
    "beyond.b1t": "@nyagagram",
    "beyond.b1d": "Photos shot on the GR. I also built the dedicated intro site myself.",
    "beyond.b1p2": "I keep a RICOH GR in my pocket and collect the light, shadows and small moments of the street. Shooting, developing and the intro site — all my own work.",
    "beyond.b1link": "Open Instagram",
    "beyond.b2k": "AI music & video",
    "beyond.b2t": "Lofi Space",
    "beyond.b2d": "Lofi music and visuals made with generative AI — wholesome content only.",
    "beyond.b2p2": "Music, visuals and thumbnails are all produced solo with a mix of generative AI tools — and that workflow know-how feeds straight back into my day job.",
    "beyond.b2link": "Open channel",
    "beyond.b3k": "YouTube",
    "beyond.b3t": "Card games",
    "beyond.b3d": "Making and posting videos themed around card games.",
    "beyond.b3p2": "Planning, filming, editing and streaming — all handled end to end by myself. Live streams and pack openings, made to be enjoyed together with viewers.",
    "beyond.b3link": "Open channel",
```

- [ ] **Step 4: EN に footer.beyond を追加**

EN 側 `"contact.rights"` の行の直後に追加:

```js
    "footer.beyond": "What I make outside the job",
```

- [ ] **Step 5: 構文チェック**

Run: `node --check js/i18n.js`
Expected: 出力なし(exit 0)

- [ ] **Step 6: Commit**

```bash
git add js/i18n.js
git commit -m "i18n: add Beyond page keys (lead, second paragraphs, back links, footer link)"
```

※ `nav.beyond` はこの時点ではまだ index.html のナビが参照しているので消さない(Task 5 で削除)。

---

### Task 2: styles.css — 新ページ用スタイルの追加

**Files:**
- Modify: `css/styles.css`(末尾の Reduced motion ブロック `@media (prefers-reduced-motion: reduce)` の**直前**に追記)

- [ ] **Step 1: Beyond ページ用 CSS を追記**

`/* ---------- Reduced motion ---------- */` コメントの直前に以下を挿入:

```css
/* ---------- Beyond page ---------- */
.back-link { font-family: var(--font-mono); font-size: var(--fs-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--fg-dim); white-space: nowrap; }
.back-link:hover { color: var(--fg); }
.bp-hero { padding-block: clamp(8rem, 16vh, 11rem) clamp(2.5rem, 5vw, 4rem); }
.bp-hero .bp-lead { color: var(--fg-dim); max-width: 48ch; font-size: var(--fs-body); }
.bp-act { padding-block: clamp(3.5rem, 7vw, 6rem); border-top: 1px solid var(--line); }
.bp-grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: clamp(2rem, 4.5vw, 4.5rem); align-items: center; }
.bp-grid.flip .bp-media { order: 2; }
.bp-media img { width: 100%; display: block; border: 1px solid var(--line); border-radius: 4px; }
.video-embed { position: relative; aspect-ratio: 16 / 9; background: var(--bg-elev); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; }
.video-embed iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.bp-text { display: flex; flex-direction: column; gap: 0.9rem; }
.bp-text .bp-k { font-family: var(--font-mono); font-size: var(--fs-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-dim); }
.bp-text h3 { font-size: var(--fs-h3); font-weight: 500; letter-spacing: -0.01em; }
.bp-text p { color: var(--fg-dim); font-size: var(--fs-body); max-width: 52ch; }
.bp-link { margin-top: 0.4rem; font-family: var(--font-mono); font-size: var(--fs-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent-text); display: inline-flex; gap: 0.5em; align-items: center; }
.bp-end { padding-block: clamp(2rem, 4vw, 3rem) clamp(3rem, 5vw, 5rem); }
.bp-end .footer-bar { margin-top: 0; }
.bp-end .footer-bar a { color: var(--fg-dim); }
.bp-end .footer-bar a:hover { color: var(--fg); }
.fb-beyond { color: var(--fg-dim); display: inline-flex; gap: 0.5em; align-items: center; }
.fb-beyond:hover { color: var(--fg); }
@media (max-width: 900px) {
  .bp-grid { grid-template-columns: 1fr; align-items: start; }
  .bp-grid.flip .bp-media { order: 0; }
}
```

使用している CSS 変数(`--font-mono` `--fs-mono` `--fs-h3` `--fs-body` `--fg` `--fg-dim` `--accent-text` `--bg-elev` `--line`)はすべて既存の `:root` 定義済み。

- [ ] **Step 2: 目視で括弧の対応を確認**

Run: `grep -c "{" css/styles.css && grep -c "}" css/styles.css`
Expected: 2 つの数が一致する(追記前も一致している前提での簡易チェック)

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "css: add Beyond page styles (feature rows, video embed, back link)"
```

---

### Task 3: beyond.html — 新規ページ作成

**Files:**
- Create: `beyond.html`(リポジトリルート、index.html と同階層)

- [ ] **Step 1: beyond.html を以下の内容で作成**

ポイント: プリローダー・Three.js(hero.js)・モバイルメニュー・menu-toggle は**載せない**。ヘッダーは brand + 戻るリンク + JA/EN + テーマ切替のみ。`.section-head h2` は main.js の SplitType 演出対象になる。

```html
<!DOCTYPE html>
<html lang="ja" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>
    /* Set theme before first paint to avoid a flash + an on-load color transition. */
    (function () {
      try {
        var t = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
        document.documentElement.setAttribute("data-theme", t);
      } catch (e) {}
    })();
  </script>
  <title>Beyond Work — Nagano Shotaro</title>
  <meta name="description" content="Nagano Shotaro が仕事の外でつくっているもの。写真（@nyagagram）、生成AIによる Lofi 音楽・映像、カードゲーム動画。" />
  <meta name="author" content="Nagano Shotaro" />
  <meta name="theme-color" content="#0a0b09" />

  <!-- OGP -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Beyond Work — Nagano Shotaro" />
  <meta property="og:description" content="仕事の外でつくっているもの。写真・AI音楽・カードゲーム動画。" />
  <meta property="og:image" content="assets/og.png" />

  <!-- favicon (inline SVG) -->
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230a0b09'/%3E%3Cpath d='M9 23V9h2.4l9.2 9.6V9H23v14h-2.4l-9.2-9.6V23z' fill='%23e8862b'/%3E%3C/svg%3E" />

  <!-- fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="css/styles.css" />
</head>
<body lang="ja">

  <!-- Custom cursor -->
  <div id="cursor-dot"></div>
  <div id="cursor-ring"><span class="clabel"></span></div>

  <!-- Scroll progress -->
  <div id="scroll-progress" aria-hidden="true"></div>

  <!-- Header -->
  <header class="site-header">
    <a class="brand" href="index.html"><span class="dot"></span><span>N. SHOTARO</span></a>
    <nav class="nav">
      <a class="back-link" href="index.html" data-i18n="beyond.back">← ポートフォリオ</a>
      <div class="nav-tools">
        <button id="lang-btn" class="tool-btn lang-btn" aria-label="Switch language"><b class="ja on">JA</b><span class="sep">/</span><b class="en">EN</b></button>
        <button id="theme-btn" class="tool-btn theme-btn" aria-label="Toggle theme">
          <svg class="ic-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
          <svg class="ic-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/></svg>
        </button>
      </div>
    </nav>
  </header>

  <main>
    <!-- Title -->
    <section class="bp-hero" data-screen-label="Beyond Work">
      <div class="shell">
        <div class="section-head">
          <span class="eyebrow" data-i18n="beyond.eyebrow">Beyond Work</span>
          <h2 class="r-up" data-i18n-html="beyond.title"><span class="nb">仕事の外で、</span><span class="nb">つくっているもの。</span></h2>
        </div>
        <p class="bp-lead r-up" data-i18n="beyond.lead">エンジニアの仕事から離れた場所でも、手を動かしてつくり続けています。写真、音楽、映像 — 3つの活動を紹介します。</p>
      </div>
    </section>

    <!-- 01 Photography -->
    <section class="bp-act">
      <div class="shell">
        <div class="bp-grid">
          <div class="bp-media r-up">
            <img src="assets/by-instagram.jpg" alt="@nyagagram の写真グリッド" loading="lazy" decoding="async" />
          </div>
          <div class="bp-text">
            <span class="bp-k r-up" data-i18n="beyond.b1k">写真 / Instagram</span>
            <h3 class="r-up" data-i18n="beyond.b1t">@nyagagram</h3>
            <p class="r-up" data-i18n="beyond.b1d">GR で撮りためた写真を発信。専用の紹介サイトも自作しました。</p>
            <p class="r-up" data-i18n="beyond.b1p2">RICOH GR をポケットに入れて、街の光と影、ふとした瞬間を切り取っています。撮影から現像、紹介サイトの制作まで、すべて自分の手で。</p>
            <a class="bp-link r-up" href="https://www.instagram.com/nyagagram" target="_blank" rel="noopener"><span data-i18n="beyond.b1link">Instagram を開く</span> <span class="arr">↗</span></a>
          </div>
        </div>
      </div>
    </section>

    <!-- 02 Lofi Space -->
    <section class="bp-act">
      <div class="shell">
        <div class="bp-grid flip">
          <div class="bp-media r-up">
            <div class="video-embed">
              <iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=UU2ZDLk_oaVtE51Ydk4Xv2DA" title="Lofi Space — YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          </div>
          <div class="bp-text">
            <span class="bp-k r-up" data-i18n="beyond.b2k">AI 音楽・映像</span>
            <h3 class="r-up" data-i18n="beyond.b2t">Lofi Space</h3>
            <p class="r-up" data-i18n="beyond.b2d">生成AIを使った Lofi の音楽・映像制作。健全なコンテンツのみを発信しています。</p>
            <p class="r-up" data-i18n="beyond.b2p2">作曲も映像もサムネイルも、生成AIツールを組み合わせて一人で制作。ツールの選び方や品質の整え方は、仕事での AI 活用にもそのまま活きています。</p>
            <a class="bp-link r-up" href="https://www.youtube.com/@lofi-space-p7e" target="_blank" rel="noopener"><span data-i18n="beyond.b2link">チャンネルを開く</span> <span class="arr">↗</span></a>
          </div>
        </div>
      </div>
    </section>

    <!-- 03 Card games -->
    <section class="bp-act">
      <div class="shell">
        <div class="bp-grid">
          <div class="bp-media r-up">
            <div class="video-embed">
              <iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=UUzzdKQyJhgm0ciD7rwtCY6w" title="カードゲーム — YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          </div>
          <div class="bp-text">
            <span class="bp-k r-up" data-i18n="beyond.b3k">YouTube</span>
            <h3 class="r-up" data-i18n="beyond.b3t">カードゲーム</h3>
            <p class="r-up" data-i18n="beyond.b3d">カードゲームをテーマにした動画を制作・投稿しています。</p>
            <p class="r-up" data-i18n="beyond.b3p2">企画から撮影・編集・配信まで一人で担当。ライブ配信やパック開封など、視聴者と一緒に楽しめる動画づくりを目指しています。</p>
            <a class="bp-link r-up" href="https://youtube.com/channel/UCzzdKQyJhgm0ciD7rwtCY6w" target="_blank" rel="noopener"><span data-i18n="beyond.b3link">チャンネルを開く</span> <span class="arr">↗</span></a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <section class="bp-end">
      <div class="shell">
        <div class="footer-bar">
          <a href="index.html" data-i18n="beyond.backlong">← ポートフォリオへ戻る</a>
          <span>© <span id="year">2026</span> Nagano Shotaro</span>
        </div>
      </div>
    </section>
  </main>

  <!-- Back to top -->
  <button id="to-top-fab" aria-label="ページ上部へ戻る" data-cursor="TOP">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"></path><path d="M6 11l6-6 6 6"></path></svg>
  </button>

  <!-- libraries (Three.js / hero.js は不要) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
  <script src="https://unpkg.com/split-type@0.3.4/umd/index.min.js"></script>

  <!-- app -->
  <script src="js/i18n.js"></script>
  <script src="js/main.js"></script>
  <script>document.getElementById("year").textContent = new Date().getFullYear();</script>
</body>
</html>
```

- [ ] **Step 2: サーバーを立てて 200 を確認**

Run(既に 8000 番で立っていればそのまま流用):
`python -m http.server 8000`(バックグラウンド)
`curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/beyond.html`
Expected: `200`

- [ ] **Step 3: ブラウザ確認(webapp-testing スキル / Playwright 推奨)**

http://localhost:8000/beyond.html を開いて確認:
- タイトル・リード・3 活動(画像 1 + 動画埋め込み 2)が表示される
- YouTube プレイヤーが 16:9 で表示される(再生はネットワーク依存なので表示まででよい)
- JA/EN ボタンで全テキストが切り替わる(`beyond.b1p2` 等のキー名がそのまま表示されていないこと)
- テーマ切替でダーク/ライトが切り替わる
- ヘッダーの「← ポートフォリオ」と brand で index.html に戻れる

※ この時点ではコンソールに GSAP の "target .hero-inner not found" 警告が出るのは既知(Task 4 で解消)。エラー(赤)が無いことだけ確認。

- [ ] **Step 4: Commit**

```bash
git add beyond.html
git commit -m "feat: add Beyond Work dedicated page with YouTube embeds"
```

---

### Task 4: main.js — ヒーロー用 GSAP セレクタのガード追加

beyond.html には `.hero` が無いため、セレクタ文字列指定の GSAP tween が console.warn を出す。2 箇所をガードする。

**Files:**
- Modify: `js/main.js`(`initScroll()` 内の hero exit parallax、`boot()` 内の runPreloader コールバック)

- [ ] **Step 1: initScroll 内の hero parallax をガード**

現在のコード:

```js
      // hero exit parallax — content drifts up + fades as you leave
      gsap.to(".hero-inner", { yPercent: -16, opacity: 0.15, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 25%", scrub: true } });
      gsap.to(".hero-name", { opacity: 0, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "40% top", scrub: true } });
```

これを以下に置き換え:

```js
      // hero exit parallax — content drifts up + fades as you leave
      if (document.querySelector(".hero")) {
        gsap.to(".hero-inner", { yPercent: -16, opacity: 0.15, ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 25%", scrub: true } });
        gsap.to(".hero-name", { opacity: 0, ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "40% top", scrub: true } });
      }
```

- [ ] **Step 2: boot の preloader コールバックをガード**

現在のコード:

```js
    runPreloader(() => {
      buildHero(false);
      if (hasGSAP && !REDUCE) {
        gsap.fromTo(".hero-eyebrow, .hero-lead, .hero-cta, .hero-name",
```

条件を 1 つ追加して以下に置き換え:

```js
    runPreloader(() => {
      buildHero(false);
      if (hasGSAP && !REDUCE && document.querySelector(".hero")) {
        gsap.fromTo(".hero-eyebrow, .hero-lead, .hero-cta, .hero-name",
```

- [ ] **Step 3: 構文チェック + 両ページで警告が消えたか確認**

Run: `node --check js/main.js`
Expected: 出力なし(exit 0)

ブラウザで http://localhost:8000/beyond.html を再読み込みし、コンソールに GSAP の "target not found" 警告が無いこと。index.html 側でヒーロー演出(スクロールでヒーローが薄くなる)が壊れていないことも確認。

- [ ] **Step 4: Commit**

```bash
git add js/main.js
git commit -m "fix: guard hero-only GSAP tweens so beyond.html logs no warnings"
```

---

### Task 5: index.html — Beyond セクション削除・ナビ整理・フッターリンク追加

**Files:**
- Modify: `index.html`(ナビ 64〜69 行付近、モバイルメニュー 84〜88 行付近、BEYOND セクション 147〜186 行付近、footer-bar 411〜414 行付近)
- Modify: `js/i18n.js`(`nav.beyond` を JA/EN から削除)

- [ ] **Step 1: デスクトップナビから「04 その他」を削除し連絡を繰り上げ**

現在:

```html
        <a href="#work"><span class="num">01</span><span data-i18n="nav.work">実績</span></a>
        <a href="#about"><span class="num">02</span><span data-i18n="nav.about">自己紹介</span></a>
        <a href="#skills"><span class="num">03</span><span data-i18n="nav.skills">スキル</span></a>
        <a href="#beyond"><span class="num">04</span><span data-i18n="nav.beyond">その他</span></a>
        <a href="#contact"><span class="num">05</span><span data-i18n="nav.contact">連絡</span></a>
```

置き換え:

```html
        <a href="#work"><span class="num">01</span><span data-i18n="nav.work">実績</span></a>
        <a href="#about"><span class="num">02</span><span data-i18n="nav.about">自己紹介</span></a>
        <a href="#skills"><span class="num">03</span><span data-i18n="nav.skills">スキル</span></a>
        <a href="#contact"><span class="num">04</span><span data-i18n="nav.contact">連絡</span></a>
```

- [ ] **Step 2: モバイルメニューも同様に**

現在:

```html
    <a href="#work"><span data-i18n="nav.work">実績</span><span class="num">01</span></a>
    <a href="#about"><span data-i18n="nav.about">自己紹介</span><span class="num">02</span></a>
    <a href="#skills"><span data-i18n="nav.skills">スキル</span><span class="num">03</span></a>
    <a href="#beyond"><span data-i18n="nav.beyond">その他</span><span class="num">04</span></a>
    <a href="#contact"><span data-i18n="nav.contact">連絡</span><span class="num">05</span></a>
```

置き換え:

```html
    <a href="#work"><span data-i18n="nav.work">実績</span><span class="num">01</span></a>
    <a href="#about"><span data-i18n="nav.about">自己紹介</span><span class="num">02</span></a>
    <a href="#skills"><span data-i18n="nav.skills">スキル</span><span class="num">03</span></a>
    <a href="#contact"><span data-i18n="nav.contact">連絡</span><span class="num">04</span></a>
```

- [ ] **Step 3: BEYOND セクションを丸ごと削除**

`<!-- BEYOND -->` コメントから、その直後の `<section class="beyond" id="beyond" ...>` の閉じ `</section>` までを削除(次の `<!-- STRENGTHS (horizontal pin) -->` は残す)。

- [ ] **Step 4: footer-bar に Beyond ページへのリンクを追加**

現在:

```html
        <div class="footer-bar">
          <span data-i18n="contact.rights">システムエンジニア / AI × 自動化 × Web</span>
          <span>© <span id="year">2026</span> Nagano Shotaro</span>
        </div>
```

置き換え:

```html
        <div class="footer-bar">
          <span data-i18n="contact.rights">システムエンジニア / AI × 自動化 × Web</span>
          <a class="fb-beyond" href="beyond.html"><span data-i18n="footer.beyond">仕事の外でつくっているもの</span> <span class="arr">→</span></a>
          <span>© <span id="year">2026</span> Nagano Shotaro</span>
        </div>
```

- [ ] **Step 5: i18n.js から nav.beyond を削除**

JA 側の `"nav.beyond": "その他",` の行と、EN 側の `"nav.beyond": "Beyond",` の行を削除。

- [ ] **Step 6: 検証**

Run: `node --check js/i18n.js && grep -c "beyond" index.html`
Expected: node は出力なし。grep は `1`(footer の `href="beyond.html"` のみ。`#beyond` 参照が 0 になっていること)

ブラウザで http://localhost:8000/ を確認:
- ナビが 01 実績 / 02 自己紹介 / 03 スキル / 04 連絡 の 4 項目
- Beyond セクションが消え、Works → Strengths(横スクロール)へ自然につながる
- フッターの「仕事の外でつくっているもの →」で beyond.html に遷移できる
- EN 切替でフッターリンクが "What I make outside the job" になる
- コンソールにエラーなし

- [ ] **Step 7: Commit**

```bash
git add index.html js/i18n.js
git commit -m "feat: move Beyond Work off the main page; footer link only"
```

---

### Task 6: 不要コードの掃除 + README 更新

**Files:**
- Modify: `css/styles.css`(旧 `.beyond*` カードスタイル削除)
- Modify: `js/main.js`(カーソル対象セレクタから `.beyond-card` を削除)
- Modify: `README.md`(構成の説明に beyond.html を追加)

- [ ] **Step 1: 旧 Beyond カードの CSS を削除**

`css/styles.css` から以下をすべて削除:
- `.beyond { padding-block: var(--section-y); }` から `.beyond-card .bc-link.none { ... }` までの一連のルール(616〜633 行付近。間の `.beyond-card[href*="nyagagram"]` / `.beyond-card[href*="UCzzdKQ"]` も含む)
- `@media (max-width: 900px)` 内の次の 3 行:

```css
  .beyond-grid { grid-template-columns: 1fr; }
  .beyond-card { min-height: 0; }
  .beyond-card .bc-media { aspect-ratio: 16 / 7; }
```

(この media query 内の `.htrack .spanel { ... }` は残す)

- [ ] **Step 2: main.js のカーソル対象から .beyond-card を削除**

`bindCursorTargets` 内(2 箇所ではなく関数定義 1 箇所)の:

```js
      (scope || document).querySelectorAll("a, button, .work, [data-cursor], .magnetic, input, .beyond-card").forEach((el) => {
```

を:

```js
      (scope || document).querySelectorAll("a, button, .work, [data-cursor], .magnetic, input").forEach((el) => {
```

- [ ] **Step 3: README の構成説明を更新**

`README.md` の構成コードブロック内、`index.html` の行の下に追加:

```
beyond.html       # 仕事の外の活動（写真 / Lofi / カードゲーム）
```

- [ ] **Step 4: 参照が残っていないか確認**

Run: `grep -rn "beyond-card\|beyond-grid\|bc-media\|bc-img\|bc-body\|bc-k\b\|bc-link" css js index.html`
Expected: マッチなし(exit 1)

Run: `node --check js/main.js && grep -c "{" css/styles.css && grep -c "}" css/styles.css`
Expected: node 出力なし、括弧数が一致

- [ ] **Step 5: Commit**

```bash
git add css/styles.css js/main.js README.md
git commit -m "chore: remove stale beyond-card styles; document beyond.html in README"
```

---

### Task 7: 最終 QA(両ページ・両テーマ・両言語・モバイル幅)

**Files:** 変更なし(確認のみ)。webapp-testing スキル(Playwright)の使用を推奨。

- [ ] **Step 1: デスクトップ幅(1280×800)で確認**

- http://localhost:8000/ : ナビ 4 項目、全セクション表示、フッターリンク → beyond.html 遷移、コンソールエラーなし
- http://localhost:8000/beyond.html : 3 活動表示、埋め込み 2 つ表示、戻るリンク → index 遷移、コンソールエラー・GSAP 警告なし

- [ ] **Step 2: モバイル幅(400×850)で確認**

- index: ハンバーガーメニューに 4 項目(その他が無い)、フッターリンクが縦積みで表示される
- beyond.html: bp-grid が 1 カラムに落ち、動画が幅いっぱいの 16:9、ヘッダーの「← ポートフォリオ」が表示されている(モバイルでも消えない — `.back-link` は `.nav-links` ではないので 760px の `display:none` の影響を受けない)

- [ ] **Step 3: テーマ・言語の引き継ぎ確認**

- index でライトテーマ + EN に切り替え → beyond.html へ遷移 → ライト + EN のまま表示される(localStorage 共有)
- beyond.html で JA に戻して index へ → JA のまま

- [ ] **Step 4: prefers-reduced-motion の確認(Playwright なら emulateMedia)**

reduced motion で beyond.html を開き、アニメーション無しで全コンテンツが即表示されること。

- [ ] **Step 5: 問題があれば修正してコミット、無ければ完了報告**

修正した場合はその内容ごとに小さくコミットする。
