# ⚔️ MHP2G スキルシミュレーター (Ultra-Fast)

モンスターハンターポータブル 2nd G（MHP2G / MHFU）専用の、現代的・超高速なWebスキルシミュレーターです。  
スマートフォンやPCからインストール不要で利用でき、GitHub Pagesで静的ホスティングが可能です。

---

## ✨ 主な特徴

- **⚡ 超高速探索エンジン（Web Worker + 上界枝刈り）**
  - 同値類圧縮（Equivalence Class Compression）とパレート最適化、上界枝刈り（Upper-Bound Branch & Bound）により、数千万通りの装備候補から**数十ミリ秒〜0.1秒未満**で最適解を発見。
  - Web Worker による別スレッド処理のため、計算中もブラウザUIが一切フリーズしません。
- **👘 胴系統倍加（Torso Up）完全対応**
  - クロオビS、スカルフェイス、ギザミZメイルなど、MHP2G特有の胴倍加ギミック・装飾品倍率を正確にシミュレート。
- **💎 装飾品自動最適化（Greedy Packing）**
  - 不足スキルポイントを満たす最もスロット効率の高い装飾品の組み合わせを自動算出・スロットへ自動割り当て。
- **🔍 爆速インクリメンタル検索**
  - ひらがな・カタカナ・漢字・ローマ字（例: 「たくみ」「こうきゅう」「battou」「わざもの」等）でスキルを即座にサジェスト。
- **✨ 定番・人気テンプレ構成のワンクリック呼び出し**
  - 抜刀アーティ、真・名刀テンプレ、高耳匠砥石、自動装填ラオ砲、回避ランスなどを初期搭載。
- **💡 追加発動可能スキルのサジェスト**
  - 防具の余りスロットと余剰スキルポイントから、「あと○ポイントで発動できるスキル」を自動提示。
- **🔗 URL共有 & クリップボードコピー**
  - 構成のURLをコピーして友人に共有したり、DiscordやX（Twitter）に貼れるフォーマットで1クリックコピー可能。
- **📱 モバイルファースト・PWAライクなモダンUI**
  - PSPやエミュレータをプレイしながらスマホ片手に片手操作できる快適なレスポンシブデザイン。

---

## 🛠️ 技術スタック

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Concurrency**: Web Worker (Multi-threaded processing)
- **Deployment**: GitHub Pages (via GitHub Actions)

---

## 🚀 使い方・ローカル開発

### 開発サーバーの起動

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

### プロダクションビルド

```bash
npm run build
```

`dist/` フォルダに最適化された静的アセットが出力されます。

---

## 🌐 GitHub Pages への公開手順

本リポジトリには `.github/workflows/deploy.yml` が含まれており、GitHubにプッシュするだけで自動的にビルド＆公開されます。

1. **GitHubで新しいリポジトリを作成**（例: `mhp2g-skillsim`）
2. **ローカルリポジトリをコミットしてプッシュ**:
   ```bash
   git add .
   git commit -m "Initial commit: MHP2G ultra-fast skill simulator"
   git branch -M main
   git remote add origin https://github.com/<あなたのユーザー名>/mhp2g-skillsim.git
   git push -u origin main
   ```
3. **GitHub リポジトリ設定で GitHub Pages を有効化**:
   - リポジトリの **Settings** > **Pages** を開く。
   - **Build and deployment** の **Source** を **`GitHub Actions`** に設定する。
4. 数分後、`https://<あなたのユーザー名>.github.io/mhp2g-skillsim/` にてシミュレーターが全世界に公開されます！

---

## 📜 ライセンス

MIT License
