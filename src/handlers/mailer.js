const nodemailer = require('nodemailer')
require('dotenv').config()

const mailTransport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_FROM,
    pass: process.env.MAIL_PASS
  }
})

module.exports = {
  signUpEmail: async (receiver, subject, content) => {
    try {
      await mailTransport.sendMail({
        from: 'Fusitzai Truman <info@kayaafrica.co>',
        to: receiver,
        subject: subject,
        html: content,
      })
      console.log('mail sent successfully')
    }
    catch (err) {
      console.log(err)
    }
  }
}