const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({
    userId: { type: ObjectId,
         ref: 'User',
         required: true, 
         trim: true },
    items: [{
        productId: { type: ObjectId,
             ref: 'product',
             required: true },
        quantity: { type: Number,
             required: true },
        
    }],
    totalPrice: { type: Number,
         required: true, 
         trim: true },
    totalItems: { type: Number,
         required: true,
         trim: true },
    totalQuantity: { type: Number,
         required: true,
          trim: true },
    cancellable: { type: Boolean,
         default: true },
    status: { type: String,
         default: 'pending',
          trim: true,
          enum: ["pending", "completed", "canceled"] },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean,
         default: false }
}, { timestamps: true })

module.exports = mongoose.model('order', orderSchema)