# ⚔️ MHP2G スキルシミュレーター (Ultra-Fast)

[![GitHub Pages Deployment](https://github.com/u1e2k/mhp2g-skillsim/actions/workflows/deploy.yml/badge.svg)](https://github.com/u1e2k/mhp2g-skillsim/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Web_Site-公開中-success?style=flat&logo=github)](https://u1e2k.github.io/mhp2g-skillsim/)

モンスターハンターポータブル 2nd G（MHP2G / MHFU）専用の、現代的・超高速なWebスキルシミュレーターです。  
スマートフォンやPCからインストール不要で、今すぐブラウザ上でご利用いただけます。

🔗 **公開URL**: **[https://u1e2k.github.io/mhp2g-skillsim/](https://u1e2k.github.io/mhp2g-skillsim/)**

---

## ✨ 主な特徴

- **⚡ 超高速探索エンジン（Web Worker + 上界枝刈り）**
  - 同値類圧縮（Equivalence Class Compression）とパレート最適化、上界枝刈り（Upper-Bound Branch & Bound）により、数千万通りの装備候補から**数十ミリ秒〜0.1秒未満**で最適解を発見。
  - Web Worker による別スレッド処理のため、計算中もブラウザUIが一切フリーズしません。
- **🔄 リアルタイム・自動シミュレート**
  - スキルや条件を選択・変更した瞬間に自動で即座に探索が走り、検索結果をリアルタイム更新。
- **⚔️ 検索結果に「おすすめ武器」を表示**
  - 発動したスキル構成（抜刀集中、匠業物、自動装填、貫通強化など）と相性抜群のMHP2G名器・おすすめ武器をワンクリックで確認可能。
- **⚠️ マイナス（バッド）スキルの自動相殺ヒント**
  - 「悪霊の加護」「毒倍加」「防御力DOWN」などのマイナススキルが発動した場合、余りスロットを使った具体的な打ち消し装飾品と個数を自動ナビゲート。
- **🏆 名作テンプレ防具セット集**
  - カイザーX抜刀大剣、ギザミZ汎用剣士、ナルガX回避、ラツマツ自動装填ヘビィ、夜砲貫通ヘビィなどの定番テンプレを一覧でき、1クリックでスキル条件に反映可能。
- **📖 武器別ストーリー攻略・防具ロードマップ**
  - 全11武器種について、下位・上位・G級の進行度ごとに「どの防具を作れば詰まらず攻略できるか」を完全解説。
- **⭐ お気に入り保存 & LocalStorage 永続化**
  - 気に入った装備構成をローカルにお気に入り保存。直前の検索条件も自動で保持。
- **👘 胴系統倍加（Torso Up）完全対応**
  - クロオビS、スカルフェイス、ギザミZメイルなど、MHP2G特有の胴倍加ギミック・装飾品倍率を正確にシミュレート。
- **💎 装飾品自動最適化（Greedy Packing）**
  - 不足スキルポイントを満たす最もスロット効率の高い装飾品の組み合わせを自動算出・スロットへ自動割り当て。
- **🔍 爆速インクリメンタル検索**
  - ひらがな・カタカナ・漢字・ローマ字（例: 「たくみ」「こうきゅう」「battou」「わざもの」等）でスキルを即座にサジェスト。
- **💡 追加発動可能スキルのサジェスト**
  - 防具の余りスロットと余剰スキルポイントから、「あと○ポイントで発動できるスキル」を自動提示。
- **🔗 URL共有 & クリップボードコピー**
  - 構成のURLをコピーして友人に共有したり、DiscordやX（Twitter）に貼れるフォーマットで1クリックコピー可能。
- **📱 モバイルファースト・モダンUI**
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
