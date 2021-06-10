const asyncHandler = require("../middleware/asyncHandler");
const User = require('../model/User')
const ErrorResponse = require('../utils/errorResponse');


exports.register = asyncHandler(async(req,res,next)=>{
    const { name,email,password,role} = req.body
    const user = await User.create({ name, email, password, role})
    sendtokenResponse(user, 200, res);
})

exports.login = asyncHandler(async(req,res,next)=>{
    const{email,password} = req.body
    //validate email and password
    if(!email||!password){
        return res.json(new ErrorResponse('Please provide email and password',400))
    }
    //check for user
    const user = await User.findOne({email}).select('+password')
    if(!user){
        return res.json(
          new ErrorResponse("Invalid credentials", 401)
        );
    }
    //Match the password
    const isMatch = await user.matchPassword(password);
    //if does not match
    if(!isMatch){
         return res.json(new ErrorResponse("Invalid credentials", 401));
    }
   sendtokenResponse(user,200,res)
})

//create a toeken and cookie
const sendtokenResponse = (user,statusCode,res)=>{
  //create a token
  const token = user.getSignedJwtToken();
  //create a cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRE_COOKIE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token
  });
}