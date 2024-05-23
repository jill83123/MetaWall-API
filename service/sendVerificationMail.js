const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const generateJWT = require('./generateJWT.js');

require('dotenv').config();

const sendVerificationMail = async (userData) => {
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_AUTH_CLIENT_ID,
    process.env.GOOGLE_AUTH_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_AUTH_REFRESH_TOKEN,
  });
  const accessToken = oauth2Client.getAccessToken();

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GOOGLE_AUTH_MAIL,
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_AUTH_REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  const { token } = generateJWT({ id: userData.id }, '10m');
  const url = `${process.env.FRONTEND_BASE_URL}?token=${token}`;

  const mailOptions = {
    from: `no-reply <${process.env.GOOGLE_AUTH_MAIL}>`,
    to: userData.email,
    subject: 'MetaWall 驗證信',
    html: `<p>您好，${userData.name}：</p>
           <p>請點擊以下網址進行信箱驗證</p>
           <a href="${url}">${url}</a>
           <p style="font-weight: 500">若您未索取此代碼，請忽略此郵件，可能有人不慎輸入了您的電子郵件。</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationMail;
