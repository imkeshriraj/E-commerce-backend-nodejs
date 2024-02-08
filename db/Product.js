const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    brand: String,
    userId: String,
    // countInStock: Number,
    // description: String,
    // image: String,
    // rating: Number,
    // numReviews: Number,
    // reviews: [
    //     {
    //         name: String,
    //         rating: Number,
    //         comment: String,
    //     },
    // ],
});

module.exports = mongoose.model('products', productSchema);