# lattendance
研究室の出席管理ツール（Node.js, Express）  
レスポンシブ対応済
<div align="center">
  <img src="https://user-images.githubusercontent.com/64352857/125099653-37b26b00-e113-11eb-8e16-d7485bb58674.png" width="400">
</div>

## 概要
研究室用の出席登録システムです。  
GitHubアカウントでログインし、予定の作成・削除・編集が可能です。  
予定のURLを共有することで、予定の出欠登録状況を共有することができます。  
N予備校の教材をベースに制作しました。  
言語は主にJavascript(Node.js)、フレームワークはExpressを用いて作成しました。  
特に工夫した点は、<strong>Slackのbotを使って簡単に出欠の登録や確認をできるようにした点</strong>です。

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
heroku config:set SERVER_API_SECRET='あらかじめ定めたJWT認証に用いるAPIシークレット'
```
6.Heroku環境へのプッシュ  
```bash
git push heroku main:master
```

## 特徴
Slackとの連携設定をすることにより、Slackのチャンネル上でbotにメッセージを送信するだけで出欠の確認・登録ができます。  
botから本システムのAPIを叩く構成になっており、botのシステムを変更することで理論上すべてのチャットツールで利用できます。  
APIにはJWT認証があり、セキュリティ的にも安全です。  
Slackとの連携する場合、[lattendance-bot](https://github.com/bpeldi2oerkd8/lattendance-bot)を同時に起動し、事前に設定を行う必要があります。  
[lattendance-bot](https://github.com/bpeldi2oerkd8/lattendance-bot)の設定方法はREADMEを確認してください。  
  
また、Bootstrap4を用いているため、全ページレスポンシブ対応です。  

## 構成図
[lattendance-bot](https://github.com/bpeldi2oerkd8/lattendance-bot)との連携時の構成は以下のようになっています。  


## 機能
### トップページ


### ログイン・ログアウト機能
GitHub OAuthを用いたログイン機能があります。  
GitHubのアカウントがあれば、誰でもログイン可能です。  
ログアウトは上のナビゲーションバーの自分のユーザー名の部分をクリックすると、ログアウトボタンが出てきます。

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
チェックが出席、はてなが不明、ばつが欠席を示しています。  
出欠登録の方法は、以下の2種類あります。  
#### 1.サイト上で登録する
ログインしているユーザーのみ、自らの出欠の登録ができます。  
他のユーザーの出欠については閲覧のみ可能です。  
変更したい出欠のボタンを押すことで出欠の変更が可能です。

![attendance_list](https://user-images.githubusercontent.com/64352857/117102229-dc7e9800-adb2-11eb-94f5-40ee506b61d7.jpg)

#### 2.Slackのbot経由で登録する
事前にユーザー登録と設定を行うことで、Slackのbot経由で出欠の登録ができます。  
具体的には、以下の形式で出欠の登録・確認が可能です。  
```
@[ボット名][コマンド名][半角または全角のスペース1つ以上][日付(月/日)]
```
例えば、ある予定に7/1に出席と登録したい場合、対応するSlackチャンネル上のbotに対して、以下のメッセージを送信します。  
```
@lattendance-bot 出席　7/1
```
正常に完了した場合、以下のように登録が完了したというメッセージがbotから返され、lattendance上の出欠情報も更新されます。  


### URL共有機能
自分が作成した予定のURLを他の人に共有することができます。  
コピーボタンは1度しか押せません。  
再度押したい場合はリロードしてください。  

https://user-images.githubusercontent.com/64352857/117112494-186e2900-adc4-11eb-81b0-6d8e1d1267f8.mp4

## 推奨環境
レスポンシブ対応です。
### モバイル
|OS|Chrome|Safari|Android Browser & <br>WebView|Firefox|
|:---:|:---:|:---:|:---:|:---:|
|Android|〇|-|Android 5.0 以降|〇|
|iOS|〇|〇|-|〇|
### デスクトップ
|OS|Chrome|Firefox|Microsoft Edge<br>(chromium)|Safari|Internet Explorer|
|:---:|:---:|:---:|:---:|:---:|:---:|
|Windows|〇|〇|〇|-|×|
|macOS|〇|〇|△|〇|-|

## デプロイ環境
- Heroku

## 使用したライブラリ・フレームワーク
### バックエンド
- Node.js 14.17.1
- Express 4.17.1
- Passport 0.4.1

### データベース
- PostgreSQL 10.17
- Sequelize 5.22.4

### テスト
- Jest 25.1.0

### フロントエンド
- jQuery 3.6.0
- webpack 4.26.1
- Bootstrap 4.5.3
- Pug 3.0.2
