# Chess.com 対戦相手の国マップ

Chess.comのユーザーIDを入力すると、対戦相手の国を世界地図上に表示するWebアプリケーションです。

## 機能

- Chess.com APIを使用して対戦履歴を取得
- 対戦相手の国を抽出して集計
- OpenStreetMapとLeafletを使用した世界地図表示
- 国ごとの対戦数を表示
- 国旗絵文字による視覚的な表示
- 期間選択（チェックボックス形式）
- ローカルディスクへのデータ保存

## 使い方

1. ターミナルでプロジェクトディレクトリに移動
2. 以下のコマンドでDenoサーバーを起動:
   ```bash
   deno run --allow-net --allow-read --allow-write server.ts
   ```
3. ブラウザで http://localhost:8080 を開く
4. Chess.comのユーザーIDを入力
5. 表示される期間から取得したい期間をチェック
6. 「データを取得」をクリック

## 技術スタック

- **フロントエンド**: HTML/CSS/JavaScript（バニラJS）
- **バックエンド**: Deno + TypeScript
- **地図表示**: Leaflet.js
- **API**: Chess.com Public API
- **データ保存**: ローカルディスク（JSON）

## データ管理

- アーカイブファイル: `data/archives/username_YYYY_MM.json`
- プレイヤーファイル: `data/players/[a-z0-9other]/username.json`
- 当月データ: 30分間隔で更新
- 過去データ: 24時間有効