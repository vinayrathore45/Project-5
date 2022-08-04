const productModel = require("../models/productModel.js");
const mongoose = require('mongoose')
const file =  require("../controllers/aws.js");
const ObjectId = require('mongoose').Types.ObjectId;


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if(typeof value != "string") return false;
    return true;
};

const isValidRequestBody = function (requestBody) {
return Object.keys(requestBody).length > 0;
};



const isValidSize = function (size) {
    const validSize = size.split(",").map(x => x.toUpperCase().trim())
    let uniqueValidSize = validSize.filter((item,
      index) => validSize.indexOf(item) === index);
  
    let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
  
    for (let i = 0; i < validSize.length; i++) {
      if (!sizes.includes(validSize[i])) {
        return false
      }
    }
    return uniqueValidSize
  }




const createProduct = async function(req,res){
    try{
        if(!req.body.data) return res.status(400).send({ status: false, message:"please enter valid data" })
        const data = JSON.parse(req.body.data)
        
    const { title ,description , price ,isFreeShipping ,style,availableSizes,installments, ...rest } = data
    if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, message: "please enter details" })
   

    if (Object.keys(rest).length != 0) {
        return res.status(400).send({ status: false, msg: "Please provide suggested key" })
    }

    if (!isValid(title)) return res.status(400).send({ status: false, message: "please enter title" })
    const usedTitle = await productModel.findOne({title:title})
    if(usedTitle) return res.status(409).send({ status: false, message: "Title is already used" })

    if(!isValid(description))return res.status(400).send({ status: false, message: "please enter description" })
    if(!/^[a-zA-Z]/.test(description))return res.status(400).send({ status: false, message: "Description should start with alphabates" })
 
    if(typeof price != "number")return res.status(400).send({ status: false, message: "price should be in number" })
    if(!/^[1-9]\d*$/.test(price))return res.status(400).send({ status: false, message: "invalid price" })
    
    data.currencyId = "INR"
    data.currencyFormat = "₹"

    if(isFreeShipping != null){
        if(typeof isFreeShipping != "boolean") return res.status(400).send({ status: false, message: "isFreeShipping value should be either true or false" })
    }

        const files = req.files;
        if (!files || !files.length > 0) return res.status(400).send({ status: false, message: "please enter poductImage" })
        const myFile = files[0]
        const fileType = myFile['mimetype'];
        const validImageTypes = ['image/gif', 'image/jpeg', 'image/png' ,'image/jpg'];
        if (!validImageTypes.includes(fileType)) return res.status(400).send({ status: false, message: "Please enter valid image file" })
        //********uploading image to aws*******/
        const uploadImage = await file.uploadFile(myFile)
        console.log(uploadImage)
        req.body.productImage = uploadImage;
        
       if(!Array.isArray(availableSizes))return res.status(400).send({ status: false, message: "availableSizes should be an array" }) 
       
       if(availableSizes.length == 0)return res.status(400).send({ status: false, message: "At  least one size is required" }) 
        if (!(availableSizes.every(val => ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(val)))) {
            return res.status(400).send({ status: false, msg: 'You Can enter Only ["S", "XS", "M", "X", "L", "XXL", "XL"] in sizes ' })
        };
        
        if(style != null){
            if(!isValid(style))return res.status(400).send({ status: false, message: "please enter valid style" })
        }
        if(installments != null){
            if(typeof installments != "number")return res.status(400).send({ status: false, message: "please enter valid installment number" })
        }

        let product = await productModel.create(data)
        return res.status(201).send({ status: true, message: "product created successfully", data: product })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const updatedProduct = async function (req, res) {
    try {
        let productId = req.params.productId;
        if(!req.body.data) return res.status(400).send({ status: false, message:"please enter valid data" })
        let data = JSON.parse(req.body.data)
        let { title, description, price,  isFreeShipping, style, installments , availableSizes , ...rest } = data

        if (!ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "PRoductId is Invalid" });
        }
        //check if id is present in Db or Not ? 
        let product = await productModel.findById(productId)
        if (!product) return res.status(404).send({ status: false, msg: "ProductId is not present in DB " })

        // check if isDeleated Status is True
        if (product.isDeleted == true) return res.status(400).send({ status: false, msg: "product is Deleted" })

        //check if the data in request body is present or not ?
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Noting to Update in Request from Body" });
        }

        if (Object.keys(rest).length != 0) {
            return res.status(400).send({ status: false, msg: "Please provide suggested key" })
        }

       
        var regEx = /^[a-zA-Z0-9]{2,100}$/

        //check the title unique or not 
        if(title != null){

            // check it is valid title or not? (using regular expression)
            if (!regEx.test(title)) {
                return res.status(400).send({ status: false, msg: "title text is invalid" });
            }
            let findTitle = await productModel.findOne({ title: title })
            if (findTitle) {
                return res.status(400).send({ status: false, msg: "title is Already Present in DB" })
            }
            product.title = title
        }


        if (description != null) {
            if(!isValid(description)) return res.status(400).send({ status: false, msg: "description invalid " })
             product.description = description
        }

        
        if(price != null){
        if(typeof price != "number")return res.status(400).send({ status: false, message: "price should be in number" })
        if(!/^[1-9]\d*$/.test(price))return res.status(400).send({ status: false, message: "invalid price" })
         product.price = price
}
        if(isFreeShipping != null){
        if (!(typeof isFreeShipping === "boolean")) 
            return res.status(400).send({ status: false, msg: "isFreeShipping Must be TRUE OR FALSE" });
            product.isFreeShipping = isFreeShipping
        }
        
        if(installments != null){
            if(typeof installments != "number") return res.status(400).send({ status: false, msg: " installments should be number" })
            product.installments = installments
        }


        // image validation
        if (req.files.length > 0) {
            const files = req.files;
            if (!files && files.length > 0) return res.status(400).send({ status: false, message: "please enter profileImage" })
            const myFile = files[0]
            const fileType = myFile['mimetype'];
            const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
            if (!validImageTypes.includes(fileType)) return res.status(400).send({ status: false, message: "Please enter valid image file" })
            //***uploading image to aws**/
            const uploadImage = await file.uploadFile(myFile)

            product.productImage = uploadImage;
        }

        if(style != null){
            if(!isValid(style))return res.status(400).send({ status: false, message: "type of style should be string" })
            product.style = style
        }
        
            if(availableSizes != null){
                let newSizes = isValidSize(availableSizes)  
                for(let i = 0 ; i < newSizes.length ; i++){
                    if(!product.availableSizes.includes(newSizes[i])){
                        product.availableSizes.push(newSizes[i])
                    }
                    
                }
            }
            
            product.save()

       

        //  let updateProduct = await productModel.findByIdAndUpdate(productId, { $set: data }, { new: true })

        return res.status(200).send({ status: true, msg: "succesfully created", data: product });

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
const filterProduct = async function (req, res) {
    try {
        const data = req.query


        if (Object.keys(data).length == 0) {
            const allProducts = await productModel.find({ isDeleted: false })
            if (allProducts.length == 0) {
                return res.status(404).send({ status: false, message: "No products found" })
            }
            return res.status(200).send({ status: true, message: "products fetched successfully", data: allProducts })

        } else {
            let availableSizes = req.query.size
            let name = req.query.name
            let priceGreaterThan = req.query.priceGreaterThan
            let priceLessThan = req.query.priceLessThan

            let filter = { isDeleted: false }

            if (name != null) {
                if(!/^[a-zA-Z0-9]{1,30}$/.test(name) )return res.status(400).send({ status: false, message: "name should contain only alphabets" })
                filter.title ={$regex:name,$options:"i"}

            }

            if (priceGreaterThan != null) {
                if (!/^[+]?([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(priceGreaterThan)) return res.status(400).send({ status: false, message: "price filter should be a vaid number" })
                filter.price = { $gt: `${priceGreaterThan}` }
            }

            if (priceLessThan != null) {
                if (!/^[+]?([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(priceLessThan)) {
                    return res.status(400).send({ status: false, message: "price filter should be a vaid number" })
                }
                filter.price = { $lt: `${priceLessThan}` }
            }

            if (availableSizes != null) {
                if(isValidSize(availableSizes).length != 0){
                 let reqSizes = isValidSize(availableSizes) 
                 console.log(reqSizes)
                    filter.availableSizes = { $in: `${reqSizes}` }
                } else {
                    return res.status(400).send({ status: false, message: `size should be one these only ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                }
            }

            //sorting
            if (req.query.priceSort != null) {
                if ((req.query.priceSort != 1 && req.query.priceSort != -1)) {
                    return res.status(400).send({ status: false, message: 'use 1 for low to high and use -1 for high to low' })
                }
            }

            if (!priceGreaterThan && !priceLessThan) {
                const productList = await productModel.find(filter).sort({ price: req.query.priceSort })
                if (productList.length == 0) {
                    return res.status(404).send({ status: false, message: "No products available" })
                }
                return res.status(200).send({ status: true, message: "Products list", data: productList })
            }

            if (priceGreaterThan && priceLessThan) {
                const productList = await productModel.find({
                    $and: [filter, { price: { $gt: priceGreaterThan } }, {
                        price: { $lt: priceLessThan }
                    }]
                }).sort({ price: req.query.priceSort })
                if (productList.length == 0) {
                    return res.status(404).send({ status: false, message: "No available products" })
                }
                return res.status(200).send({ status: true, message: "Products list", data: productList })
            }

            if (priceGreaterThan || priceLessThan) {
                const productList = await productModel.find(filter).sort({ price: req.query.priceSort })
                if (productList.length == 0) {
                    return res.status(404).send({ status: false, message: "No available products" })
                }
                return res.status(200).send({ status: true, message: "Products list", data: productList })
            }

        }
    
     } catch (error) {
        res.status(500).send({ status: false, Error: "Server not responding", message: error.message, });
    }
}
const getProductById = async function(req,res){
    try{
     let productId = req.params.productId;

    if(!mongoose.isValidObjectId(productId))return res.status(400).send({status:false,msg:"The given productId is not valid"})

    let product = await productModel.findById(productId);

    if(!product)return res.status(404).send({status:false,msg:"The given productId is not there in database"})

    if(product.isDeleted == true) return res.status(400).send({status:false,msg:"The product is deleted"})

    return res.status(200).send({status:true,msg:"success",data:product})            
        

    }catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
const deletedProduct = async function (req, res) {
    try{
    let productId = req.params.productId;

    if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, msg: "productId is Invalid" })

    let product = await productModel.findById(productId)
    if(!product) return res.status(404).send({status: false, msg: "Product is not present" })

    //check if isDeleated Status is True
    if (product.isDeleted) {
        return res.status(404).send({ status: false, msg: "Product is already Deleted" })
    }

    //update the status of isDeleted to TRUE
     await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), });
    
    return res.status(200).send({ status: true, message: "successfuly Deleted" });
}catch (err) {
    return res.status(500).send({ status: false, message: err.message })
}

}

module.exports = {createProduct , updatedProduct , getProductById , deletedProduct ,filterProduct}