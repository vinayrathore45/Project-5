const express = require('express');
const router = express.Router();
const { createUser, updatedUser, userLogin, getUser } = require('../controllers/userControllers.js')
const {auth} = require('../middleware/auth.js')


router.post('/register', createUser)
router.post('/login', userLogin)
router.get('/user/:userId/profile',auth , getUser)
router.post('/user/:userId/profile',auth , updatedUser)


module.exports = router