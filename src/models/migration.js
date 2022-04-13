const { pool } = require('../config/server')
const { userSchema } = require('./schemas/userschema')
const { clientSchema } = require('./schemas/clientschema')
const { driverSchema } = require('./schemas/driverschema')
const exactLocationSchema = require('./schemas/exactlocationschema')
const truckTypeSchema = require('./schemas/trucktypeschema')
const { truckAvailabilitySchema } = require('./schemas/orderschema')


const createTable = async (schemaQuery) => {
  try {
    await pool.query(schemaQuery)
  }
  catch (err) {
    throw err.message
  }
}

const importTableData = async (tableSchema, tableName, data) => {
  await createTable(tableSchema)
  try {
    if (data.length > 0) {
      for (let i = 0, len = data.length; i <= len; i += 1) {
        const keys = Object.keys(data[i])
        const values = Object.values(data[i])
        const query = `INSERT INTO ${tableName} (${keys}) VALUES (${values}) `;
        await pool.query(query)
      }
    }
  }
  catch (err) {
    console.log(err)
  }
}

const createAllTables = async () => {
  try {
    await importTableData(userSchema, 'users', [])
    await importTableData(clientSchema, 'clients', [])
    await importTableData(exactLocationSchema, 'exactLocations', [])
    await importTableData(truckTypeSchema, 'truckTypes', [])
    await importTableData(driverSchema, 'drivers', [])
    await importTableData(truckAvailabilitySchema, 'truckAvailability', [])
    console.log("All table created successfully.")
  }
  catch (err) {
    console.log(err)
  }
}

createAllTables()

