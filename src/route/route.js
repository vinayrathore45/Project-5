const express = require('express');
const router = express.Router();
const { createUser, updatedUser, userLogin, getUser } = require('../controllers/userControllers.js')
const { createProduct, updatedProduct , getProductById , deletedProduct , filterProduct } = require('../controllers/productControllers.js')
const {auth} = require('../middleware/auth.js')


router.post('/register', createUser)

router.post('/login', userLogin)

router.get('/user/:userId/profile',auth , getUser)

router.put('/user/:userId/profile',auth , updatedUser)

router.post('/products', createProduct)

router.get('/products', filterProduct)

router.put('/products/:productId',auth , updatedProduct)

router.get('/products/:productId',auth , getProductById)

router.delete('/products/:productId',auth , deletedProduct)


module.exports = router