
const jwt=require('jsonwebtoken')


//.........................MIDDLEWARE-FOR AUTHENTICATION..........................................................

const auth= async (req,res,next) =>{
    try{
    let bearerToken= req.headers.authorization;
   
    let bearer = bearerToken.split(' ')
    if(bearer.length<2)return res.status(401).send({ status: false, message: "Please, provide the token" });
    let token = bearer[1];

     let decodedToken = jwt.verify(token, "group09" )
    //  , function(err , data){
      //    if(err) return res.status(401).send({ status: false, message: "Incorrect Token" })
      //   });
      
         req.userId = decodedToken.userId
      
  next(); 

  } catch (err) {
    if(err.message=="invalid token") return res.status(401).send({status:false, msg:"invalid token"})
    if(err.message=="invalid signature") return res.status(401).send({status:false, msg:"invalid signature"})
    // if(err.message=="jwt must be provided") return res.status(401).send({status:false, msg:"jwt must be provided"})
    res.status(500).send({ status: false, error: err.message });
  }};

  module.exports.auth = auth