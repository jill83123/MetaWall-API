const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'MetaWall API 文件',
      description:
        '**到元宇宙展開全新社交貼文動態牆**<br>※ 登入成功後請點「 Authorize 🔓 」輸入 Token',
    },
    servers: [
      {
        url: 'https://node-training-2024.onrender.com/',
        description: 'Render 伺服器',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: '請輸入 Token',
        },
      },
    },
    tags: [
      {
        name: '使用者相關',
      },
      {
        name: '動態貼文',
      },
      {
        name: '貼文按讚功能',
      },
      {
        name: '貼文留言功能',
      },
      {
        name: '追蹤功能',
      },
      {
        name: '其它',
      },
    ],
  },
  apis: [
    './docs/swagger_responses.yaml',
    './docs/swagger_components.yaml',
    './routes/*.js',
    './controllers/*.js',
  ],
};

if (process.env.NODE_ENV === 'dev') {
  options.swaggerDefinition.servers.unshift({
    url: 'http://localhost:3000/',
    description: '本地端',
  });
}

const swaggerDocs = swaggerJsdoc(options);
module.exports = swaggerDocs;
