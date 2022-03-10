const { GENERATE_TOKEN } = require('../middlewares/middleware')
require('dotenv').config()

module.exports = {
  signUpWelcomeEmail: () => {
    const frontEndUrl = process.env.FRONTEND_URL
    const tokenGenerated = GENERATE_TOKEN({ purpose: 'verifyEmailAddress' }, 300)
    const verificationLink = `${frontEndUrl}?verifywith=${tokenGenerated}`
    return `
      <html>
        <head>
          <title></title>
        </head>
        <body>
          <p> Please use this activation link to verify your email address <a href="${verificationLink}">${verificationLink}</a></p>
          
          <p>If you did not initiate this registration, please ignore and contact <a href="mailto:support@kayapay.com">support@kayapay.com</a></p>

          <p>Thank you.</p>
          
          <p>Please do not respond to this email</p>

          <p>For explicit user support:<br />
            Email: support@kayapay.com <br />
            Phone No(s): +234 802 2440 810
          </p>

        </body>
      </html>
    `
  }
}