const express = require('express');
const router = express.Router();
const { createUser, updatedUser, userLogin, getUser } = require('../controllers/userControllers.js')
const { createCart } = require('../controllers/cartControllers.js')
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

router.post('/users/:userId/cart ', userLogin)

router.post('/users/:userId/orders', createOrder)

router.put('/users/:userId/orders', updateOrder)



router.all("/*",function(req,res){
    res.status(400).send({
        status:false,msg:"The endpoint is not correct"
    });
});


module.exports = router