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

   const { items , totalPrice ,totalItems } = req.body
//    const { productId ,quantity } = items

const existingCart = await cartModel.findOne({userId : userId})
if(existingCart){
     existingCart.push(items)
}
}
const getCart = async function(req,res){
    try{
        const userId = req.params.userId;
        if(!mongoose.isValidObjectId(userId)) return res.status(400).send({status:false,msg:"userId is not valid"})

         const user = await userModel.findById(userId)
         if(!user) return res.status(404).send({ status: false, message: "user not exist in Database" })

         const getCartData = await cartModel.findById(userId).select({_id: 0}) 

         if (!getCartData) return res.status(404).send({ status: false, message: "cart not found" })

        return res.status(200).send({ status: true, message: "Cart Details", data: getCartData })
    }catch (err) {
        return res.status(500).send({ status: false, message: err.message })
} 
}

const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId
       

        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: true, Message: "Invalid ProductId !" })
     
        const checkCart = await cartModel.findOne({ userId: userId })

        if (!checkCart) return res.status(400).send({ status: false, Message: 'cart not found ' })
       
       if (checkCart.items.length==0)return res.status(400).send({ status: false, Message: "Cart is already empty" })
      
       await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 })
       
       res.status(200).send({ status: true, Message: 'sucessfully deleted' })
    } catch (error) { 
      res.status(500).send({ status: false, Message: error.message }) }
}