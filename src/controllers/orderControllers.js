const userModel = require("../models/userModel.js");
const orderModel = require("../models/orderModel.js");
const cartModel = require("../models/cartModel.js");
const mongoose = require('mongoose');

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if(typeof value != "string") return false;
  return true;
};

const createOrder = async function(req,res){
    try{
    const userId = req.params.userId


    if(!isValid(userId))return res.status(400).send({ msg: "Please enter userId" })
    if(!mongoose.isValidObjectId(userId)) return res.status(400).send({ msg: "inavalid userId" })
    let user = await userModel.findById(userId)
    if(!user) return res.status(404).send({status:false , message : "No such user present"})

    if(req.userId != userId)return res.status(403).send({status: false , message: "Authorization failed" });
    

    const { cartId , cancellable } = req.body

    if(!isValid(cartId)) ({status:false , message : "please enter cartId"})
    if(!mongoose.isValidObjectId(cartId)) return res.status(400).send({ msg: "inavalid cart Id" })

    if(cancellable != null){
      if(cancellable != "boolean")return res.status(400).send({status:false , message : "The cancellable value should be either true or false"})
  }


    let cart = await cartModel.findById(cartId)
    
    if(!cart) return res.status(404).send({status:false , message : "No such cart present"})
    if(cart.items.length == 0) return res.status(400).send({status:false , message : "Cart is empty"})

    if (userId!=cart.userId) return res.status(400).send({ status: false, Message: 'userId in params should be equal to userId of Cart ' })




     let quantity = 0;
    for (let i = 0 ; i < cart.items.length ; i++){
         quantity += cart.items[i].quantity
    }

    const reqOrder = {
        userId : userId,
        items : cart.items,
        totalPrice : cart.totalPrice,
        totalItems : cart.totalItems,
        totalQuantity : quantity,
        cancellable : cancellable 

    }

    const createOrder = await orderModel.create(reqOrder)

    cart.items = []
    cart.totalPrice = 0
    cart.totalItems = 0
    cart.save()

    return res.status(201).send({status:true , data: createOrder })
} catch (err) {
    return res.status(500).send({ status: false, message: err.message })
}
}

const updateOrder = async function (req, res) {
    try{
    let userId = req.params.userId;

    
    if(!isValid(userId))return res.status(400).send({ msg: "Please enter userId" })
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).send({ status: false, msg: "userId is not valid" });
    }
  
    let user = await userModel.findById(userId);
  
    if (!user) {
      return res.status(404).send({ status: false, msg: "user  not found" });
    }
    if(req.userId != userId)return res.status(403).send({status: false , message: "Authorization failed" });


    let data = req.body;
    let { orderId, status } = data;
  
    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "please fill the data" });
    }
  
  
    if (!isValid(orderId))return res.status(400).send({ status: false, msg: "Please enter orderId" });
    if (!mongoose.isValidObjectId(orderId)) return res.status(400).send({ status: false, msg: "OrderId is not valid" });
    
    if (!isValid(status)) return res.status(400).send({ status: false, message: "status is required to update order" });
    
  
    let order = await orderModel.findOne({_id:orderId,isDeleted:false})
  
    if (!order)  return res.status(404)({ status: false, msg: "Order not Found" });
    if(order.status != "pending") return res.status(400).send({ status: false, msg: `order-status is already ${order.status}` });
    
  
    if (order.userId != userId) return res.status(400).send({ status: false, msg: "Make sure OrderId and UserId is correct" });
  
    
  
    let validStatus = ["completed", "cancelled"];
    if (!validStatus.includes(status)) return res.status(400).send({status: false,message: "status should be  completed or cancelled"});
    


  if(status == "cancelled"){
    if (order.cancellable == false) {
        return res
          .status(400)
          .send({ status: false, message: "This order is not cancellable" });
      }
  }
  
    const updateOrder = await orderModel.findOneAndUpdate(
      { _id: orderId },
      { status: status },
      { new: true }
    );
    return res
      .status(200)
      .send({
        status: true,
        message: "Order updated successfully",
        data: updateOrder,
      });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
  };


module.exports = {createOrder , updateOrder}