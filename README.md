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
Slackとの連携をする場合、[lattendance-bot](https://github.com/bpeldi2oerkd8/lattendance-bot)を同時に起動し、事前に設定を行う必要があります。  
[lattendance-bot](https://github.com/bpeldi2oerkd8/lattendance-bot)の設定方法はREADMEを確認してください。  
  
また、Bootstrap4を用いているため、全ページレスポンシブ対応です。  

## 構成図
[lattendance-bot](https://github.com/bpeldi2oerkd8/lattendance-bot)との連携時の構成は以下のようになっています。
<div align="center">
  <img src="https://user-images.githubusercontent.com/64352857/125193182-2047bf00-e286-11eb-97da-0fa231ba318e.jpg" width="500">
</div>

## 機能
### トップページ
<div align="center" style="display:flex;">
  <img src="https://user-images.githubusercontent.com/64352857/125193586-18891a00-e288-11eb-9632-193563122d2c.jpg" width="600">
  <img src="https://user-images.githubusercontent.com/64352857/125193592-1fb02800-e288-11eb-90ce-229cf48d03d1.jpg" width="200">
</div>
<div align="center" style="display:flex;">
  <img src="https://user-images.githubusercontent.com/64352857/125193869-b6311900-e289-11eb-90bf-abeb957dd212.jpg" width="600">
  <img src="https://user-images.githubusercontent.com/64352857/125193876-bb8e6380-e289-11eb-9447-b00e4d4cea34.jpg" width="200">
</div>

### ログイン・ログアウト機能
GitHub OAuthを用いたログイン機能があります。  
GitHubのアカウントがあれば、誰でもログイン可能です。  
ログアウトは上のナビゲーションバーの自分のユーザー名の部分をクリックすると、ログアウトボタンが出てきます。

![ログインページ](https://user-images.githubusercontent.com/64352857/125193923-eed0f280-e289-11eb-9ef1-0ef59791580a.jpg)
![OAuthページ](https://user-images.githubusercontent.com/64352857/125193942-06a87680-e28a-11eb-8962-3ddb6e19fa86.jpg)
![ログアウトボタンを押したとき](https://user-images.githubusercontent.com/64352857/125193959-1aec7380-e28a-11eb-8b09-3f742e78087f.jpg)

### URL共有機能
自分が作成した予定のURLを他の人に共有することができます。  
コピーボタンは1度しか押せません。  
再度押したい場合はリロードしてください。  

https://user-images.githubusercontent.com/64352857/117112494-186e2900-adc4-11eb-81b0-6d8e1d1267f8.mp4

### 予定一覧表示機能
ログインしている場合、ログイン済みのユーザーが作成した予定の一覧が更新日時の近い順に表示されます。  
それぞれの予定をクリックすると、その予定のページに移動します。  

![予定一覧](https://user-images.githubusercontent.com/64352857/125194048-846c8200-e28a-11eb-9073-4eea2e70ccac.jpg)

### 予定作成機能
新規の予定を作成できます。  
予定名と説明、日程を改行区切りで入れることで予定の作成が可能です。  

![予定作成](https://user-images.githubusercontent.com/64352857/125194064-98b07f00-e28a-11eb-984a-6e5c04ebc967.jpg)

### 予定削除・編集機能
削除・編集ボタンから予定の削除・編集ができます。  
削除・編集ができるのは、予定の作成者のみです。  
編集後、出欠情報はリセットされます。  

![予定ページ](https://user-images.githubusercontent.com/64352857/125194165-22604c80-e28b-11eb-8380-d0dd91fc0d4b.jpg)
![予定削除確認](https://user-images.githubusercontent.com/64352857/125194177-3441ef80-e28b-11eb-9bf5-e05fe705c9a8.jpg)
![予定の編集](https://user-images.githubusercontent.com/64352857/125194210-44f26580-e28b-11eb-9cb0-5e3d5b971973.jpg)

予定作成者ではない場合は、この項目は表示されません。  

![予定ページ(作成者以外)](https://user-images.githubusercontent.com/64352857/125194913-51c48880-e28e-11eb-89a2-e8702f8a71df.jpg)

### Slackとの連携登録機能
Slackとの連携登録ができます。  
記載されている手順に従い、チャンネルIDを登録・トークンを発行・環境変数としてトークンを登録することでbot経由で出欠登録が可能になります。  

![Slackとの連携1](https://user-images.githubusercontent.com/64352857/125194702-618f9d00-e28d-11eb-866d-5f2f8ef0a200.jpg)
![Slack連携2](https://user-images.githubusercontent.com/64352857/125194707-66545100-e28d-11eb-8079-abc4254b8f19.jpg)

登録が完了すると、予定ページに「Slack連携済み」と記載されます。  

![Slack連携済](https://user-images.githubusercontent.com/64352857/125194756-90a60e80-e28d-11eb-9511-4879fe5ebd8b.jpg)

予定作成者ではない場合は、この項目は表示されません。  

![予定ページ(作成者以外)](https://user-images.githubusercontent.com/64352857/125194913-51c48880-e28e-11eb-89a2-e8702f8a71df.jpg)

### Slackとの連携設定変更機能
Slackとの連携設定の変更ができます。  
変更可能な項目は、以下の3つです。  
- Slack連携の解除
- チャンネルIDの変更
- トークンの再発行

![Slack連携設定の変更](https://user-images.githubusercontent.com/64352857/125195237-c946e780-e28f-11eb-9bb7-2ccda5efd508.jpg)

### 出欠登録機能
チェックが出席、はてなが不明、ばつが欠席を示しています。  
出欠登録の方法は、以下の2種類あります。  
#### 1.サイト上で登録する
ログインしているユーザーのみ、自らの出欠の登録ができます。  
他のユーザーの出欠については閲覧のみ可能です。  
変更したい出欠のボタンを押すことで出欠の変更が可能です。  

![出欠登録(サイト上)](https://user-images.githubusercontent.com/64352857/125194289-8e42b500-e28b-11eb-8fa7-b85ca8fcf283.jpg)

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
<div align="center">
  <img src="https://user-images.githubusercontent.com/64352857/125194309-a61a3900-e28b-11eb-8a10-3d5e5d003a9d.jpg" width="500">
</div>

## 推奨環境
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
