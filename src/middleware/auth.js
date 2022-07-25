const userModel=require('../models/userModel')

const jwt=require('jsonwebtoken')


//.........................MIDDLEWARE-FOR AUTHENTICATION..........................................................

const auth= async (req,res,next) =>{
    try{
    let bearerToken= req.headers['authorization'];
    if(!bearerToken) return res.status(400).send({ status: false, message: "Please, provide the token" });
  
   
    let bearer = bearerToken.split(' ')
    let token = bearer[1];

     jwt.verify(token, "group16" , function(err , data){
        if(err) return res.status(401).send({ status: false, message: "Incorrect Token" })
        req.body.userId = data
     });

  next(); 

  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }};

  module.exports.auth = auth