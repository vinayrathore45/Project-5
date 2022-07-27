const cartModel = require("../models/cartModel.js");
const userModel = require("../models/userModel.js");

// {
//     userId: {ObjectId, refs to User, mandatory, unique},
//     items: [{
//       productId: {ObjectId, refs to Product model, mandatory},
//       quantity: {number, mandatory, min 1}
//     }],
//     totalPrice: {number, mandatory, comment: "Holds total price of all the items in the cart"},
//     totalItems: {number, mandatory, comment: "Holds total number of items in the cart"},
//     createdAt: {timestamp},
//     updatedAt: {timestamp},
//   }

const createCart = async function(req,res){
    const userId = req.params.userId
    if(!mongoose.isValidObjectId(userId)) return res.status(400).send({ msg: "inavalid id format" })
    let user = await userModel.findById(userId)
    if(!user) return res.status(404).send({status:false , message : "No such user present"})

    let cart = await cartModel.findOne({userId : userId})
    

}