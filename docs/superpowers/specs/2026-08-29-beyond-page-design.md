# Beyond Work 別ページ化 — 設計書

日付: 2026-08-29

## 目的

index.html 内の「Beyond Work(仕事の外で、つくっているもの。)」セクションを専用ページ `beyond.html` に分離する。仕事系コンテンツ(実績・スキル・連絡)と趣味・個人活動を完全に分け、趣味側は内容を拡充してリッチに見せる。

## 方針(承認済み)

- **アプローチ**: 共通デザインシステム再利用。`beyond.html` は既存の `css/styles.css` / `js/i18n.js` / `js/main.js` を読み込み、テーマ切替・JA/EN 切替・カーソル演出・スクロールアニメを本体と共有する。Three.js(`hero.js`)は読み込まない。
- **導線**: ナビからは削除し、フッター(Contact セクションの `.footer-bar` 付近)からのみ `beyond.html` へリンク。仕事系と完全分離。

## 変更内容

### 1. index.html

- `<section class="beyond" id="beyond">` を丸ごと削除。
- ヘッダーナビとモバイルメニューから「04 その他」(`#beyond`)を削除し、「連絡」を 05 → 04 に繰り上げ。
- Contact セクションの `.footer-bar` に「Beyond Work →」リンク(`beyond.html` へ)を追加。i18n キー `footer.beyond` を使用。

### 2. beyond.html(新規)

構成(上から順):

1. **ページヘッダー** — 既存 `.site-header` を流用。ブランドロゴは `index.html` へ戻るリンク。ナビリンクの代わりに「← Portfolio」リンク + JA/EN 切替 + テーマ切替。モバイルメニューは持たない(リンクが少ないため)。
2. **タイトルブロック** — eyebrow「Beyond Work」+ 大見出し「仕事の外で、つくっているもの。」+ リード文(1〜2 文)。
3. **写真 / @nyagagram** — 大きめのビジュアル(既存 `assets/by-instagram.jpg`)+ 拡充した紹介文(RICOH GR での街撮りスタイル、紹介サイトを自作した話)+ Instagram への外部リンク。
4. **Lofi Space** — YouTube 埋め込みプレイヤー + 拡充した紹介文(生成 AI での音楽・映像制作フロー)+ チャンネルへの外部リンク。
5. **カードゲーム CH** — YouTube 埋め込みプレイヤー + 拡充した紹介文 + チャンネルへの外部リンク。
6. **フッター** — 「← Portfolio に戻る」導線 + コピーライト(index の `.footer-bar` と同等の見た目)。

各セクションは index と同じ `.shell` / `.section-head` / `.r-up` パターンを使い、スクロールで順に現れる。

**YouTube 埋め込みの仕様:**

- チャンネルのアップロード一覧プレイリスト埋め込み(`https://www.youtube.com/embed/videoseries?list=UU...`)を使う。チャンネル ID の `UC` を `UU` に置換したものがアップロードプレイリスト ID。
- カードゲーム CH: チャンネル ID `UCzzdKQyJhgm0ciD7rwtCY6w` → プレイリスト `UUzzdKQyJhgm0ciD7rwtCY6w`。
- Lofi Space: ハンドル `@lofi-space-p7e` のみ判明しているため、実装時にチャンネルページからチャンネル ID を取得する。取得できない場合は埋め込みなし(画像 + リンクカード)にフォールバック。
- iframe は `loading="lazy"` + `youtube-nocookie.com` ドメインを使用。16:9 のレスポンシブラッパーで包む。

### 3. js/i18n.js

- 既存の `beyond.*` キーを新ページ用に拡張(リード文、各活動の長文説明、戻るリンクのラベルなど)。JA / EN 両方。
- `footer.beyond`(index フッターのリンクラベル)を追加。
- 不要になったキーがあれば削除。

### 4. css/styles.css

- 新ページ固有のスタイル(タイトルブロック、活動セクションのレイアウト、動画ラッパー、戻るリンク)を末尾に追記。既存の CSS 変数・ブレークポイント・`no-motion` フォールバックの流儀に従う。
- ダーク / ライト両テーマで確認。

### 5. js/main.js

- 原則変更なし(各初期化は要素が無ければスキップするガード付きのため、beyond.html でもそのまま動く想定)。
- beyond.html に存在しない要素(works-grid、モーダル、モバイルメニュー等)への参照で例外が出る場合のみ、ガードを追加する最小修正。

## エラー処理・フォールバック

- YouTube 埋め込みはネットワーク不通・埋め込み不可でも iframe が空になるだけでレイアウトは崩れない(ラッパーに背景色)。
- `prefers-reduced-motion` 時は既存の `no-motion` クラスの挙動に従い、アニメーションなしで全要素表示。
- JS 無効時でもコンテンツ(テキスト・画像・リンク)は閲覧可能。

## テスト(手動確認)

ローカルサーバー(`python -m http.server 8000`)で:

1. index: Beyond セクションが消え、ナビが 01〜04 になっている。フッターのリンクから beyond.html に遷移できる。
2. beyond.html: 3 活動が表示され、YouTube 埋め込みが再生できる。外部リンクが正しい。
3. 両ページで JA/EN 切替・テーマ切替が動き、設定が localStorage 経由でページ間で引き継がれる。
4. モバイル幅(〜480px)でレイアウト崩れがない。
5. コンソールにエラーが出ていない。

## スコープ外

- Instagram の公式埋め込み(不安定なため使わない)。
- 写真ギャラリーの追加画像(手元に `by-instagram.jpg` 1 枚のみのため今回は 1 枚構成。追加画像の提供があれば拡張可能)。
- ビルドツール導入・構成変更。
