const ErrorResponse = require("../utils/errorResponse");
const errorHandler = (err, req, res, next) => {
  // console.log(err.stack.red)
  let error = {...err}
  const message = err.message
  
  //Mongoose bad objectID
  if(err.name==='CastError'){
    const message = `Resource not found with id ${err.value}`
    error = new ErrorResponse(message,404)
  }

  //Mongoose duplicate key
  if(err.code === 11000){
    const message = "Duplicate field value entered"
    error = new ErrorResponse(message,400)
  }

  //mongoose validation error
  if(err.name==="ValidationError"){
    const message = Object.values(err.errors).map(val=>val.message)
    err = new ErrorResponse(message, 400);
  }

  // console.log(err)
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });

}

module.exports = errorHandler;
