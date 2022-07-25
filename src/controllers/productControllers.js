const productModel = require("../models/productModel.js");
const file =  require("../controllers/aws.js");

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if(typeof value != "string") return false;
    return true;
};

const createProduct = async function(req,res){
    // title: {string, mandatory, unique},
    // description: {string, mandatory},
    // price: {number, mandatory, valid number/decimal},
    // currencyId: {string, mandatory, INR},
    // currencyFormat: {string, mandatory, Rupee symbol},
    // isFreeShipping: {boolean, default: false},
    // productImage: {string, mandatory},  // s3 link
    // style: {string},
    // availableSizes: {array of string, at least one size, enum["S", "XS","M","X", "L","XXL", "XL"]},
    // installments: {number}
    const { title ,description , price ,currencyId,currencyFormat,isFreeShipping ,style,availableSizes,installments } = req.body

    if (!isValid(title)) return res.status(400).send({ status: false, message: "please enter title" })
    const usedTitle = await productModel.findOne({email:email})
    if(usedTitle) return res.status(409).send({ status: false, message: "Title is already used" })

    
}