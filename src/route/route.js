const express = require('express');
const router = express.Router();
const { createUser, updatedUser, userLogin, getUser } = require('../controllers/userControllers.js')
const { createCart ,updatedCart, getCart, deleteCart } = require('../controllers/cartControllers.js')
const { createProduct, updatedProduct , getProductById , deletedProduct , filterProduct } = require('../controllers/productControllers.js')
const { createOrder , updateOrder} = require('../controllers/orderControllers.js')
const {auth} = require('../middleware/auth.js')




router.post('/register', createUser)

router.post('/login', userLogin)

router.get('/user/:userId/profile',auth , getUser)

router.put('/user/:userId/profile',auth , updatedUser)

router.post('/products', createProduct)

router.get('/products', filterProduct)

router.put('/products/:productId', updatedProduct)

router.get('/products/:productId', getProductById)

router.delete('/products/:productId', deletedProduct)
//--------------------------cart--------------------------------------------------------------//
router.post('/users/:userId/cart', auth , createCart)

router.put('/users/:userId/cart', auth , updatedCart)

router.get('/users/:userId/cart', auth , getCart)

router.delete('/users/:userId/cart',auth , deleteCart)
//---------------------------orders----------------------------------------------------------//
router.post('/users/:userId/orders', auth ,createOrder)

router.put('/users/:userId/orders', auth , updateOrder)



router.all("/*",function(req,res){
    res.status(400).send({
        status:false,msg:"The endpoint is not correct"
    });
});


module.exports = router