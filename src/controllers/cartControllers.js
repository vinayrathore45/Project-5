const cartModel = require("../models/cartModel.js");
const userModel = require("../models/userModel.js");
const productModel = require("../models/productModel.js");
const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value != "string") return false;
  return true;
};

const createCart = async function (req, res) {
  try {
    const userId = req.params.userId;
    const { cartId, productId, quantity } = req.body;

    if (cartId) {
      if (!mongoose.isValidObjectId(cartId))
        return res.status(400).send({ msg: "inavalid id format" });
    }

    if (!mongoose.isValidObjectId(userId))
      return res.status(400).send({ msg: "inavalid id format" });
    let user = await userModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .send({ status: false, message: "No such user present" });
    // if(!mongoose.isValidObjectId(items.productId)) return res.status(400).send({ msg: "inavalid id format" })
    let product = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!product)
      return res
        .status(404)
        .send({ status: false, message: "No such product present" });

    const existingCart = await cartModel.findOne({ userId: userId });
    if (existingCart) {
      if (!cartId)
        return res
          .status(400)
          .send({
            status: false,
            message: "The cart is already present please provide cartId",
          });
      if (cartId != existingCart._id)
        return res
          .status(400)
          .send({
            status: false,
            message: "This cart do not belongs to this user",
          });
      for (let i = 0; i < existingCart.items.length; i++) {
        if (existingCart.items[i].productId == productId) {
          existingCart.items[i].quantity += quantity;
          existingCart.totalPrice += product.price * quantity;
          existingCart.save();
          return res.status(200).send({ status: true, message: existingCart });
        } else {
          let newProduct = { productId: productId, quantity: quantity };
          existingCart.items.push(newProduct);
          existingCart.totalPrice += product.price * quantity;
          existingCart.totalItems++;
          existingCart.save();
          return res.status(200).send({ status: true, message: existingCart });
        }
      }
    }
    const data = {
      userId: userId,
      items: [{ productId: productId, quantity: quantity }],
      totalPrice: product.price * quantity,
      totalItems: 1,
    };
    const newCart = await cartModel.create(data);
    return res.status(201).send({ status: true, data: newCart });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updatedCart = async function (req, res) {
  const userId = req.params.userId;
  let data = req.body;
  let { cartId, productId, removeProduct } = data;
  if (!ObjectId.isValid(cartId)) {
    return res.status(400).send({ status: false, msg: "cartId is Invalid" });
  }

  let cart = await cartModel.findById(cartId);
  if (!cart)
    return res
      .status(404)
      .send({ status: false, msg: "cart is not present in DB " });
  if (userId != cart.userId)
    return res
      .status(400)
      .send({
        status: false,
        Message: "userId in params should be equal to userId of Cart ",
      });

  // if (cart.isDeleted == true) return res.status(400).send({ status: false, msg: "cart is Already Deleted" })

  if (!ObjectId.isValid(productId)) {
    return res.status(400).send({ status: false, msg: "productId is Invalid" });
  }

  let product = await productModel.findById(productId);
  if (!product)
    return res
      .status(404)
      .send({ status: false, msg: "product is not present in DB " });

  if (product.isDeleted == true)
    return res
      .status(400)
      .send({ status: false, msg: "product is Already Deleted" });

  if (!isValid(removeProduct))
    return res.status(400).send({ status: false, message: "please enter " });
  if (!/^[0|1]{1}$/.test(removeProduct))
    return res
      .status(400)
      .send({
        status: false,
        message: "remove product should be either 0 or 1",
      });

  if (Object.keys(data).length == 0) {
    return res
      .status(400)
      .send({ status: false, msg: "Noting to Update in Request from Body" });
  }

  for (let i = 0; i < cart.items.length; i++) {
    if (cart.items[i].productId.toString() == product._id.toString()) {
      if (removeProduct == 1 && cart.items[i].quantity > 1) {
        cart.items[i].quantity = cart.items[i].quantity - 1;
        cart.save();
        const updatedCart = await cartModel.findOneAndUpdate(
          { _id: cartId },
          {
            $inc: { totalPrice: -product.price },
            totalItems: cart.items.length,
          },
          { new: true }
        );

        updatedCart.items = cart.items;

        return res
          .status(200)
          .send({
            status: true,
            message: "product added to cart",
            data: updatedCart,
          });
      } else {
        const updatedCart = await cartModel.findOneAndUpdate(
          { _id: cartId },
          {
            $pull: { items: { productId: productId } },
            $inc: {
              totalItems: -1,
              totalPrice: -(product.price * cart.items[i].quantity),
            },
          },
          { new: true }
        );
        return res
          .status(200)
          .send({
            status: true,
            message: "product  is removed",
            data: updatedCart,
          });
      }
    }
  }
};

const getCart = async function (req, res) {
  try {
    const userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, msg: "userId is not valid" });

    const user = await userModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .send({ status: false, message: "user not exist in Database" });

    const getCartData = await cartModel
      .findOne({ userId: userId })
      .populate([{ path: "items.productId" }]);

    if (!getCartData)
      return res.status(404).send({ status: false, message: "cart not found" });

    return res
      .status(200)
      .send({ status: true, message: "Cart Details", data: getCartData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const deleteCart = async function (req, res) {
  try {
    const userId = req.params.userId;

    if (!mongoose.isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: true, Message: "Invalid ProductId !" });

    const checkCart = await cartModel.findOne({ userId: userId });

    if (!checkCart)
      return res
        .status(400)
        .send({ status: false, Message: "cart not found " });

    if (checkCart.items.length == 0)
      return res
        .status(400)
        .send({ status: false, Message: "Cart is already empty" });

    await cartModel.findOneAndUpdate(
      { userId: userId },
      { items: [], totalPrice: 0, totalItems: 0 }
    );

    res.status(200).send({ status: true, Message: "sucessfully deleted" });
  } catch (error) {
    res.status(500).send({ status: false, Message: error.message });
  }
};

module.exports = { createCart, updatedCart, getCart, deleteCart };