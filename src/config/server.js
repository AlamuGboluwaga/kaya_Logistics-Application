const { Pool } = require('pg')
require('dotenv').config()

const PORT = process.env.ENV === 'development' ? 5000 : process.env.PORT

const config = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
}

const pool = new Pool(config)

module.exports = {
  START_APPLICATION: (appInstance) => {
    try {
      appInstance.listen(PORT, async () => {
        await pool.connect()
        console.log(`SERVER RUNNING ON PORT: ${PORT}`)
      })
    }
    catch (err) {
      console.log(`Oops! SOMETHING WENT WRONG: ${err.message}`)
    }
  },

  pool,
}