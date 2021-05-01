# lattendance
研究室の出席管理ツール（Node.js, Express）

## 概要
研究室用の出席登録システムです。  
GitHubアカウントでログインし、予定の作成・削除・編集が可能です。  
予定のURLを共有することで、予定の出欠登録状況を共有することができます。  
N予備校の教材をベースに制作しました。  
言語は主にNode.js、フレームワークはExpressを用いて作成しました。

## デモ
ここに動画

## ダウンロードとHerokuへのデプロイ方法
1.このリポジトリをダウンロードする  
2.Herokuのアカウントを作成し、Heroku CLIをインストール  
3.Herokuへログインし、Heroku上にアプリを作成  
```bash
heroku login -i  
heroku create
```
4.Heroku上にデータベースを作成  
```bash  
heroku addons:create heroku-postgresql:hobby-dev
```
5.環境変数のセット  
```bash
heroku config:set HEROKU_URL='作成したHerokuアプリのURL'  
heroku config:set GITHUB_CLIENT_ID='GitHub OAuthで登録したアプリのクライアントID'  
heroku config:set GITHUB_CLIENT_SECRET='GitHub OAuthで登録したアプリのクライアントシークレット'  
heroku config:set SESSION_INFO='あらかじめ定めたセッションシークレット'
```
6.Heroku環境へのプッシュ  
```bash
git push heroku main:master
```

## 機能
### ログイン・ログアウト機能
GitHub OAuthを用いたログイン機能があります。  
GitHubのアカウントがあれば、誰でもログイン可能です。  
ログアウトは上のナビゲーションバーの自分のユーザーの部分をクリックすると、ログアウトボタンが出てきます。

### 予定一覧表示機能
ログインしている場合、ログイン済みのユーザーが作成した予定の一覧が更新日時の近い順に表示されます。  
それぞれの予定をクリックすると、その予定のページに移動します。

### 予定作成機能
新規の予定を作成できます。  
予定名と説明、日程を改行区切りで入れることで予定の作成が可能です。

### 予定削除・編集機能
削除・編集ボタンから予定の削除・編集ができます。  
編集後、出欠情報はリセットされます。

### 出欠登録機能
ログインしているユーザーのみ、自らの出欠の登録ができます。  
チェックが出席、はてなが不明、ばつが欠席を示しています。  
他のユーザーの出欠については閲覧のみ可能です。

### URL共有機能
自分が作成した予定のURLを他の人に共有することができます。  
コピーボタンは1度しか押せません。  
再度押したい場合はリロードしてください。

## 推奨環境
レスポンシブ対応です。
### モバイル
- Android  
Chrome最新版、Android WebView (Android5.0以降) 、Firefox最新版、Microsoft Edge (chromium) 最新版  
- iOS  
Chrome最新版、Firefox最新版、Safari最新版、Microsoft Edge (chromium) 最新版
### デスクトップ
- Windows10  
Chrome最新版、Firefox最新版、Microsoft Edge (chromium) 最新版   
- macOS  
Chrome最新版、Firefox最新版、Safari最新版

## デプロイ環境
Heroku, Node.js v14.16.1, PostgreSQL

## 使用したライブラリ・フレームワーク
### バックエンド
Node.js, Express, Jest
### フロントエンド
jQuery, webpack, bootstrap4
