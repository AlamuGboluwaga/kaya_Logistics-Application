module.exports = {
  /**
   * @description success response Object
   * @param {*} res 
   * @param {Number} statusCode | 200 | 201
   * @param {String} responseLabel 
   * @param {Object} data 
   */
  success: (res, statusCode, responseLabel, data) => {
    res.status(statusCode).json({
      status: 'success',
      message: responseLabel,
      data
    })
  },

  /**
   * @description failed response object
   * @param {*} res 
   * @param {Number} statusCode | 400 : 499 && 500 : 599
   * @param {String} responseLabel 
   */
  error: (res, statusCode, responseLabel, errorData) => {
    res.status(statusCode).json({
      status: 'error',
      message: responseLabel,
      errorData
    })
  }
}