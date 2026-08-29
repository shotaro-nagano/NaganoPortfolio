# Nagano Shotaro — Portfolio

システムエンジニア Nagano Shotaro のポートフォリオサイト。
AI活用 × 業務自動化 × Web開発。見た目はミニマル、動きはリッチ。

## 構成

静的サイト（HTML / CSS / Vanilla JS）。ビルド不要。

```
index.html        # 全セクション（OGP・favicon・SEO込み）
beyond.html       # 仕事の外の活動（写真 / Lofi / カードゲーム）
css/styles.css    # デザインシステム・レスポンシブ・モーション
js/i18n.js        # JA/EN 辞書 + Works / Skills データ
js/hero.js        # Three.js ヒーローシェーダー
js/main.js        # Lenis / GSAP / カーソル / モーダル制御
assets/           # OG画像・ヒーロー背景・資格ロゴ
```

## ローカル確認

```bash
python -m http.server 8000   # → http://localhost:8000
```

## 技術

Three.js（ヒーローWebGL） / GSAP + ScrollTrigger / Lenis（慣性スクロール） / SplitType（テキスト演出）。
ダーク・ライトテーマ切替、日本語・英語切替、`prefers-reduced-motion` フォールバック対応。
