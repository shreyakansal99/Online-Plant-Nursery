const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const passport = require("passport");
const User = require("../models/userModel.js");
const UserProfile = require("../models/userProfile.js");
const {saveRedirectUrl, ensureAuthenticated} = require("../middleware.js");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async(req, res) => {
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to Plant Nurdery!!");
            res.redirect("/home");
        });
    }
    catch(error){
        console.error("Signup Error:", error);
        req.flash("error", error.message);
        res.redirect("/home");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", saveRedirectUrl, 
    passport.authenticate("local", 
        {
            failureRedirect: "/user/login", 
            failureFlash: true
        }
    ), async (req, res) => {
        req.flash("success", "Welcome back to Plant Nursery!!");
        let redirectUrl = res.locals.redirectUrl || "/home"; 
        res.redirect(redirectUrl); 
    }
);


router.get("/logout", (req, res, next) => {
    req.logout((error) => {
        if(error){
            return next(error);
        }
        req.flash("success", "Logged out!!");
        res.redirect("/home");
    });
});

router.get("/profile", (req, res) => {
    res.render("users/profile.ejs");
});

router.post("/profile", wrapAsync(async (req, res, next) => {
    try {
        const { name, address, city, state, postalcode, phonenumber } = req.body.userProfile;
        const newUserProfile = new UserProfile({
            userid: req.user._id, 
            name, address, city, state, 
            postalcode: Number(postalcode), 
            phonenumber: Number(phonenumber), 
        });
        await newUserProfile.save();
        req.flash("success", "Profile created successfully!");
        res.redirect("/user/showProfile");
    } catch (error) {
        console.error(error);
        req.flash("error", "An error occurred while creating the profile.");
        res.redirect("/user/profile");
    }
}));

router.get("/showProfile", ensureAuthenticated, async (req, res) => {
    try {
        const userProfile = await UserProfile.findOne({ userid: req.user._id });
        res.render("users/showProfile", { userProfile }); 
    } catch (error) {
        req.flash("error", "Could not load your profile.");
        res.redirect("/home");
    }
});

module.exports = router;