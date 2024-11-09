const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const {Product} = require('../models/productModel.js');
const Review = require('../models/reviewModel.js')
const {validateReview, isReviewAuthor} = require("../middleware.js");

router.post("/", validateReview, wrapAsync(async(req, res) => {
    let product = await Product.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    product.reviews.push(newReview);
    await newReview.save();
    await product.save();
    req.flash("success", "New Review Created!");
    res.redirect(`/home/${product._id}`);
}));

router.delete("/:reviewId", isReviewAuthor, wrapAsync(async(req, res) => {
    let{id, reviewId} = req.params;
    await Product.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/home/${id}`);
}));


// // Add a review
// router.post("/", validateReview, wrapAsync(async (req, res) => {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//         req.flash("error", "Product not found.");
//         return res.redirect("/home");
//     }

//     const newReview = new Review(req.body.review);
//     newReview.author = req.user._id;
//     await newReview.save();

//     product.reviews.push(newReview);
//     await product.save();

//     req.flash("success", "New Review Created!");
//     res.redirect(`/home/${product._id}`);
// }));

// // Delete a review
// router.delete("/:reviewId", isReviewAuthor, wrapAsync(async (req, res) => {
//     const { id, reviewId } = req.params;
//     await Product.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);

//     req.flash("success", "Review Deleted!");
//     res.redirect(`/home/${id}`);
// }));



module.exports = router;