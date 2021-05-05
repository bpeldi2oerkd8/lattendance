# lattendance
研究室の出席管理ツール（Node.js, Express）

## 概要
研究室用の出席登録システムです。  
GitHubアカウントでログインし、予定の作成・削除・編集が可能です。  
予定のURLを共有することで、予定の出欠登録状況を共有することができます。  
N予備校の教材をベースに制作しました。  
言語は主にNode.js、フレームワークはExpressを用いて作成しました。

## デモ
https://user-images.githubusercontent.com/64352857/117108595-64b66a80-adbe-11eb-9e6c-0377d6bf6d9b.mp4

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

![top page](https://user-images.githubusercontent.com/64352857/117101549-688fc000-adb1-11eb-8e88-247d52948406.jpg)
![login_page](https://user-images.githubusercontent.com/64352857/117101655-ab519800-adb1-11eb-975a-d51ea1c312a1.jpg)
![OAuth_page](https://user-images.githubusercontent.com/64352857/117101710-c6bca300-adb1-11eb-9aac-b381691de5b3.jpg)
![pres_logout_button](https://user-images.githubusercontent.com/64352857/117101771-e653cb80-adb1-11eb-9467-22d9dad8ab31.jpg)

### 予定一覧表示機能
ログインしている場合、ログイン済みのユーザーが作成した予定の一覧が更新日時の近い順に表示されます。  
それぞれの予定をクリックすると、その予定のページに移動します。  

![user_page](https://user-images.githubusercontent.com/64352857/117101828-05eaf400-adb2-11eb-83ec-3c54399bb276.jpg)

### 予定作成機能
新規の予定を作成できます。  
予定名と説明、日程を改行区切りで入れることで予定の作成が可能です。  

![schedule_making_page](https://user-images.githubusercontent.com/64352857/117101888-24e98600-adb2-11eb-9204-d0d9dde04ced.jpg)

### 予定削除・編集機能
削除・編集ボタンから予定の削除・編集ができます。  
削除・編集ができるのは、予定の作成者のみです。  
編集後、出欠情報はリセットされます。  

![schedule_page](https://user-images.githubusercontent.com/64352857/117101953-3e8acd80-adb2-11eb-9f73-8450e467c870.jpg)
![delete_page](https://user-images.githubusercontent.com/64352857/117101969-45194500-adb2-11eb-8d58-5b3887e80f9c.jpg)
![edit_page](https://user-images.githubusercontent.com/64352857/117101975-49ddf900-adb2-11eb-82e1-79adeadb1afa.jpg)

### 出欠登録機能
ログインしているユーザーのみ、自らの出欠の登録ができます。  
チェックが出席、はてなが不明、ばつが欠席を示しています。  
他のユーザーの出欠については閲覧のみ可能です。  

![attendance_list](https://user-images.githubusercontent.com/64352857/117102229-dc7e9800-adb2-11eb-94f5-40ee506b61d7.jpg)

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
