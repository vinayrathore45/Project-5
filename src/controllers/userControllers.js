const userModel = require("../models/userModel.js");
const file = require("../controllers/aws.js");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const jwt= require('jsonwebtoken')
const ObjectId = mongoose.Schema.Types.ObjectId


// function isValidObjectId(id) {

//     if (ObjectId.isValid(id)) {
//         if ((String)(new ObjectId(id)) === id)
//             return true;
//         return false
//     }
//     return false
// }


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value != "string") return false;
    return true;
};
// const isValid1 = function (value) {
//     if (typeof value === "undefined" || value === null) return false;
//     if (typeof value === "string" && value.trim().length === 0) return false;
//     if (typeof value != "number") return false;
//     return true;
// };
const createUser = async function (req, res) {
    try {
        const { fname, lname, email, phone,  address } = req.body
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "please enter details" })

        if (!isValid(fname)) return res.status(400).send({ status: false, message: "please enter fname" })
        if (!/^[a-zA-Z ]{2,100}$/.test(fname)) return res.status(400).send({ status: false, message: "please enter fname" })

        if (!isValid(lname)) return res.status(400).send({ status: false, message: "please enter lname" })
        if (!/^[a-zA-Z ]{2,100}$/.test(lname)) return res.status(400).send({ status: false, message: "please enter fname" })

        if (!isValid(email)) return res.status(400).send({ status: false, message: "please enter email" })
        if (!/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(email)) return res.status(400).send({ status: false, message: "please enter valid email" })
        const usedEmail = await userModel.findOne({ email: email })
        if (usedEmail) return res.status(409).send({ status: false, message: "emailId is already used" })

        //===================================Imagefile validation==========================//
        const files = req.files;
        if (!files && files.length > 0) return res.status(400).send({ status: false, message: "please enter profileImage" })
        const myFile = files[0]
        const fileType = myFile['mimetype'];
        const validImageTypes = ['image/gif', 'image/jpeg', 'image/png' ,'image/jpg' ];
        if (!validImageTypes.includes(fileType)) return res.status(400).send({ status: false, message: "Please enter valid image file" })
        //********uploading image to aws*******/
        const uploadImage = await file.uploadFile(myFile)

        req.body.profileImage = uploadImage;

        //==================================phone validations============================//
        if (!isValid(phone)) return res.status(400).send({ status: false, message: "please enter phone number" })
        if (!/^([9876]{1})(\d{1})(\d{8})$/.test(phone)) return res.status(400).send({ status: false, message: "please enter valid phone number" })
        const usedNumber = await userModel.findOne({ phone: phone })
        if (usedNumber) return res.status(409).send({ status: false, message: " Phone number is already exist" })
        //===========================password validation===================================//
        let password = req.body.password
        if (!isValid(password)) return res.status(400).send({ status: false, message: "please enter password" })
        if (!/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password)) return res.status(400).send({ status: false, message: "Please enter strong password of atleast 8 character, It should contain atleast One Capital letter , one lower case letter and special character ," })
        //******password hashing and salting **********/
    //     const saltRounds = 10;
    //    const myPassword =  bcrypt.hash(password, saltRounds)//, function (err, hash) {
    //         req.body.password = myPassword
    //    // });
       const bcryptPassword = await bcrypt.hash(password, 10)
       req.body.password = bcryptPassword
    //    console.log(password)


        //============================address validations================================//
        const myAddress = JSON.parse(address)
        console.log(myAddress)
        if (Object.keys(myAddress).length != 2) return res.status(400).send({ status: false, message: "Shipping or billing address is missing" })
        //******shipping validation**************//
        const shipping = myAddress.shipping
        if (Object.keys(shipping).length != 3) return res.status(400).send({ status: false, message: "Some shipping details is missing" })
        const { street, city, pincode } = shipping
        
        if (!isValid(street)) return res.status(400).send({ status: false, message: "please enter shipping street details" });
        if (!isValid(city)) return res.status(400).send({ status: false, message: "please enter shipping city" });
        if (typeof(pincode)!="number") return res.status(400).send({ status: false, message: "please enter shipping pincode" });
        if (!/^[1-9][0-9]{5}$/.test(pincode)) return res.status(400).send({ status: false, message: "please enter valid shippig pincode" })

        //******billing validation**************//
        const billing = myAddress.billing
        if (Object.keys(billing).length != 3) return res.status(400).send({ status: false, message: "Some billing details is missing" })
        if (!isValid(billing.street)) return res.status(400).send({ status: false, message: "please enter billing street details" });
        if (!isValid(billing.city)) return res.status(400).send({ status: false, message: "please enter billing city" });
        if (typeof(billing.pincode)!= "number") return res.status(400).send({ status: false, message: "please enter billing pincode" });
         if (!/^[1-9][0-9]{5}$/.test(billing.pincode)) return res.status(400).send({ status: false, message: "please enter valid billing pincode" })
      
         req.body.address = myAddress

        let user = await userModel.create(req.body)
        return res.status(201).send({ status: true, message: "User created successfully", data: user })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
const userLogin = async function (req, res) {
    try{
    let { email, password } = req.body;
    
    if (!isValid(email) || !isValid(password))
    return res.status(400).send({ status: false, msg: "Provide emailId and Password both" });

    let myUser = await userModel.findOne({ email: email});
    if(!myUser)return res.status(400).send({ status: false, msg: "emailId is not present in db" });
    
    bcrypt.compare(password, myUser.password ,function(err, result) {
       if (result) {
        let token = jwt.sign({
            userId: myUser._id.toString()
        }, "group09",
            {
                expiresIn: "1h"
            });
    
        return res.status(200).send({ status: true, msg: "success", userId: myUser._id, token: token })
        
       } 
       return res.status(400).send({status: false , message:"wrong password"})

     });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }}


const getUser = async function (req, res) {
    try {
        const userId = req.params.userId;
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ msg: "inavalid id format" })

        const user = await userModel.findOne({ _id: userId });

        return res.status(200).send({ status: true, message: "User profile details", data: user });
    } catch (error) {
        // console.log({ status: false, message: error.message });
        return res.status(500).send({ status: false, message: error.message });
    }
};

const updatedUser = async function (req, res) {

        let userId = req.params.userId
        let data = req.body
        let { fname, lname, email, phone, password, address } = req.body

        //check the userId is Valid or Not ?  
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId is Invalid" });
        }

        //check if body is empty or not ?
        if (!Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Noting to Update in Request from Body" });
        }

        //check if userid is present in Db or Not ? 
        let user = await userModel.findById(userId)
        if (!user) return res.status(404).send({ status: false, msg: "userId is not present in DB" })

        var regEx = /^[a-zA-Z ]{2,100}$/

        if (fname != null) {
            if (!regEx.test(fname)) return res.status(400).send({ status: false, msg: "fname text is invalid" });
        }

        if (lname != null) {
            if (!regEx.test(lname)) return res.status(400).send({ status: false, msg: "lname text is invalid" });
        }
        //check the email unique or not 
        if (email != null) {
            if (
                !isValid(email)) return res.status(400).send({ status: false, message: "please enter email" })
            if (!/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(email)) return res.status(400).send({ status: false, message: "please enter valid email" })
            let findEmail = await userModel.findOne({ email: email })
            if (findEmail) {
                return res.status(400).send({ status: false, msg: "Email is Already Present in DB" })
            }
        }

        //check the phone unique or not 
        if (phone != null) {
            if (!isValid(phone)) return res.status(400).send({ status: false, message: "please enter phone number" })
            if (!/^([9876]{1})(\d{1})(\d{8})$/.test(phone)) return res.status(400).send({ status: false, message: "please enter valid phone number" })
            let findPhone = await userModel.findOne({ phone: phone })
            if (findPhone) return res.status(400).send({ status: false, msg: "phone is Already Present in DB" })
        }



        // useing adreess validation
        if(address != null){
        const myAddress = JSON.parse(address)
        // if (Object.keys(myAddress).length != 2) return res.status(400).send({ status: false, message: "Shipping or billing address is missing" })
        //******shipping validation**************//
        if(myAddress.shipping != null){
        const shipping = myAddress.shipping
        // if (Object.keys(shipping).length != 3) return res.status(400).send({ status: false, message: "Some shipping details is missing" })
        const { street, city, pincode } = shipping
        if(street != null){
            if (!isValid(street)) return res.status(400).send({ status: false, message: "please enter shipping street details" });
        }
        if(city != null){
            if (!isValid(city)) return res.status(400).send({ status: false, message: "please enter shipping city" });
        }
         if(pincode != null){
        if (typeof(pincode)!="number") return res.status(400).send({ status: false, message: "please enter shipping pincode" });
        if (!/^[1-9][0-9]{5}$/.test(pincode)) return res.status(400).send({ status: false, message: "please enter valid shippig pincode" })
        }
        //******billing validation**************//
        if(billing != null){
        const billing = myAddress.billing
       
        // if (Object.keys(billing).length != 3) return res.status(400).send({ status: false, message: "Some billing details is missing" })
        if(billing.address != null){
            if (!isValid(billing.street)) return res.status(400).send({ status: false, message: "please enter billing street details" });
        }
        if(billing.city != null){
            if (!isValid(billing.city)) return res.status(400).send({ status: false, message: "please enter billing city" });
        }
        if(billing.pincode != null){
        if (typeof(billing.pincode)!= "number") return res.status(400).send({ status: false, message: "please enter billing pincode" });
         if (!/^[1-9][0-9]{5}$/.test(billing.pincode)) return res.status(400).send({ status: false, message: "please enter valid billing pincode" })
        }
         req.body.address = myAddress
        }
        // image validation
        if (req.files.length > 0) {
            const files = req.files;
            if (!files && files.length > 0) return res.status(400).send({ status: false, message: "please enter profileImage" })
            const myFile = files[0]
            const fileType = myFile['mimetype'];
            const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
            if (!validImageTypes.includes(fileType)) return res.status(400).send({ status: false, message: "Please enter valid image file" })
            //********uploading image to aws*******/
            const uploadImage = await file.uploadFile(myFile)
            console.log(uploadImage)
            req.body.profileImage = uploadImage;
        }
        //check if password is valid or not ?
        if(password != null){
        var passwordReg = /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,15}$/;
        if (!passwordReg.test(password)) {
            return res.status(400).send({ status: false, msg: "pass is invalid(Minimum 8 and maximum 15 characters, at least one uppercase letter, one lowercase letter, one number and one special character Ex. Abc@123,abC%98,@abD34,1999$Sour" })
        }
        const bcryptPassword = await bcrypt.hash(password, 10)
        req.body.password = bcryptPassword

    }

        //if all condition are passed update data
        let updatedUser = await userModel.findByIdAndUpdate(userId, data, { new: true })

        return res.status(200).send({ status: true, data: updatedUser });
}
// }catch (err) {
//         return res.status(500).send({ status: false, message: err.message })
//     }

// }





module.exports = { createUser, updatedUser, userLogin, getUser }