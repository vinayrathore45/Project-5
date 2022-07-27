const productModel = require("../models/productModel.js");
const file =  require("../controllers/aws.js");

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if(typeof value != "string") return false;
    return true;
};

const createProduct = async function(req,res){
    try{
    
    const { title ,description , price ,isFreeShipping ,style,availableSizes,installments } = req.body

    if (!isValid(title)) return res.status(400).send({ status: false, message: "please enter title" })
    const usedTitle = await productModel.findOne({title:title})
    if(usedTitle) return res.status(409).send({ status: false, message: "Title is already used" })

    if(!isValid(description))return res.status(400).send({ status: false, message: "please enter description" })
    if(!/^[a-zA-Z]/.test(description))return res.status(400).send({ status: false, message: "Description should start with alphabates" })
 
    if(typeof price != "number")return res.status(400).send({ status: false, message: "price should be in number" })
    if(!/^[1-9]\d*$/.test(price))return res.status(400).send({ status: false, message: "invalid price" })
    
    req.body.currencyId = "INR"
    req.body.currencyFormat = "₹"

    if(isFreeShipping != null){
        if(typeof isFreeShipping != "boolean") return res.status(400).send({ status: false, message: "isFreeShipping value should be either true or false" })
    }

        const files = req.files;
        if (!files && files.length > 0) return res.status(400).send({ status: false, message: "please enter poductImage" })
        const myFile = files[0]
        const fileType = myFile['mimetype'];
        const validImageTypes = ['image/gif', 'image/jpeg', 'image/png' ,'image/jpg'];
        if (!validImageTypes.includes(fileType)) return res.status(400).send({ status: false, message: "Please enter valid image file" })
        //********uploading image to aws*******/
        const uploadImage = await file.uploadFile(myFile)
        console.log(uploadImage)
        req.body.productImage = uploadImage;

        if (!(availableSizes.every(val => ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(val)))) {
            return res.status(400).send({ status: false, msg: 'You Can enter Only ["S", "XS", "M", "X", "L", "XXL", "XL"] in sizes ' })
        };
        if(style != null){
            if(!isValid(style))return res.status(400).send({ status: false, message: "please enter valid style" })
        }
        if(installments != null){
            if(typeof installments != "number")return res.status(400).send({ status: false, message: "please enter valid installment number" })
        }

        let product = await productModel.create(req.body)
        return res.status(201).send({ status: true, message: "product created successfully", data: product })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const updatedProduct = async function (req, res) {
    let productId = req.params.productId;
    let data = req.body
    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, installments, deletedAt, isDeleted, ...rest } = req.body


    //check if id is present in Db or Not ? 
    let product = await productModel.findById(productId)
    if (!product) return res.status(404).send({ status: false, msg: "ProductId is not present in DB " })

    // check if isDeleated Status is True
    if (product.isDeleted) return res.status(404).send({ status: false, msg: "product is Already Deleted" })

    //check if the data in request body is present or not ?
    if (!Object.keys(data).length) {
        return res.status(400).send({ status: false, msg: "Noting to Update in Request from Body" });  
    }

    if (Object.keys(rest).length > 0) {
        return res.status(400).send({ status: false, msg: "Please provide suggested key" })
    }

    //check the ProductId is Valid or Not ?  
    if (!ObjectId.isValid(productId)) {
        return res.status(400).send({ status: false, msg: "PRoductId is Invalid" });
    }

    //check if isDeleted is TRUE/FALSE ?
    if (isDeleted && (!(typeof isDeleted === "boolean"))) {
        return res.status(400).send({ status: false, msg: "isDeleted Must be TRUE OR FALSE" });
    }

    //check the title unique or not 
    let findTitle = await bookModel.findOne({ title: title })
    if (findTitle) {
        return res.status(400).send({ status: false, msg: "title is Already Present in DB" })
    }

    var regEx = /^[a-zA-Z ]{2,100}$/
    // check it is valid title or not? (using regular expression)
    if (!regEx.test(title)) {
        return res.status(400).send({ status: false, msg: "title text is invalid" });
    }

    let updateProduct = await productModel.findByIdAndUpdate(productId, { $set: data }, { new: true })

    return res.status(200).send({ status: true, msg: "succesfully created", data: updateProduct });

}

module.exports = {createProduct , updatedProduct}