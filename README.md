# MetaWall - RESTful API

2024 Node 直播班作業

到元宇宙展開全新社交圈 - 貼文動態牆

## 介紹

主要使用 ``Express/Node.js`` 所製作，資料庫使用 ``MongoDB``

### 共 21 支 API

[Swagger API 文件](https://node-training-2024.onrender.com/api-docs/)（ ※ 部屬於 Render 免費方案，開啟時需等待數秒 ）

* 使用者相關 - 註冊、登入、重設密碼、取得個人資料、編輯個人資料
* 動態貼文 - 取得所有貼文、取得個人所有貼文、取得單一貼文、編輯單一貼文、刪除單一貼文、新增貼文
* 按讚功能 - 新增按讚、取消按讚、取得個人按讚列表
* 留言功能 - 新增留言、編輯留言、刪除留言
* 追蹤功能 - 追蹤使用者、取消追蹤使用者、取得個人追蹤名單
* 其它 - 上傳圖片

## 使用套件

### 略述

使用者註冊使用 ``bcryptjs`` 加密密碼、``validator`` 驗證資料格式

身份驗證使用 ``JWT`` 產生 token

上傳圖片先使用 ``multer`` 及 ``image-size`` 檢查格式，再上傳至 firebase storage

### 套件
* ``bcryptjs``
* ``cors``
* ``dotenv``
* ``express``
* ``firebase-admin``
* ``image-size``
* ``jsonwebtoken``
* ``mongoose``
* ``multer``
* ``swagger-jsdoc``
* ``uuid``
* ``validator``

## 資料夾結構

```
├── app.js                       # Node.js 進入點
├── /bin/
│  └── www                       # 啟動伺服器
├── /connections/                # 連接第三方服務
│  ├── firebase.js
│  └── mongodb.js
├── /controllers/
├── /docs/
│  ├── postman_collections.json  # postman 檔案
│  ├── swagger_components.yaml   # swagger api 文件 - 共用參數
│  └── swagger_responses.yaml    # swagger api 文件 - response 範例
├── /middlewares/
│  ├── auth.js                   # 驗證是否登入
│  └── checkImage.js             # 檢查圖片格式
├── /models/
├── /routes/
├── /service/
│  ├── createCustomError.js      # 建立自訂錯誤 new Error()
│  ├── decodeJWT.js              # 解密 JWT
│  ├── generateJWT.js            # 產生 JWT token
│  ├── handleAsyncCatch.js       # 處理 async fn 非同步錯誤
│  ├── handleError.js            # 錯誤訊息調整
│  └── handleSuccess.js          # success response utils
└── swagger.js                   # swagger api 文件 - 設定檔

```

## branch week3-8 概要

* week3 - 使用 express MVC 架構建立 RESTful API
* week4 - Mongoose 資料關聯
* week5 - 建立自訂錯誤並管理
* week6 - bcryptjs 加密密碼、JWT 身份驗證
* week7 - multer 檢查圖片、上傳圖片功能（ 串接 firebase storage ）
* week8 - 完成所有功能

## 執行專案

### 安裝

```sh
npm install
```

### 正式環境

```sh
npm run start
```

### 開發環境

```sh
npm run start:dev
```
