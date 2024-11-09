if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require('./models/userModel.js');
const Admin = require('./models/adminModel.js');

const rootRouter = require("./routes/root.js")
const homeRouter = require("./routes/home.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");
const reviewRouter = require("./routes/review.js");
const wishlistRouter = require("./routes/wishlist.js");
const cartRouter = require("./routes/cart.js");
const orderRouter = require("./routes/order.js");
const chatbotRouter = require("./routes/chatbot.js");

const MONGO_URL = "mongodb://127.0.0.1/plant_nursery";

main()
    .then(() => {
        console.log("connected to db");
    })
    .catch(err => {
        console.log(err);
    });

async function main(){
    await mongoose.connect(MONGO_URL);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.get("/", (req, res) => {
    res.redirect("/home");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.use(new LocalStrategy(Admin.authenticate()));

passport.serializeUser((entity, done) => {
    const userType = entity instanceof User ? 'user' : 'admin';
    done(null, { id: entity.id, type: userType });
});

passport.deserializeUser(async (obj, done) => {
    try {
        if (obj.type === 'user') {
            const user = await User.findById(obj.id);
            done(null, user);
        } else if (obj.type === 'admin') {
            const admin = await Admin.findById(obj.id);
            done(null, admin);
        }
    } 
    catch (error) {
        done(error);
    }
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    if (req.user) {
        if (req.user instanceof User) {
            res.locals.currentUser = req.user;
            res.locals.currentAdmin = null; 
        } 
        else if (req.user instanceof Admin) {
            res.locals.currentAdmin = req.user;
            res.locals.currentUser = null; 
        }
    } 
    else {
        res.locals.currentUser = null;
        res.locals.currentAdmin = null;
    }
    next();
});

app.use("/", rootRouter);
app.use("/home", homeRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/home/:id/reviews", reviewRouter);
app.use("/wishlist", wishlistRouter);
app.use("/cart", cartRouter);
app.use("/order", orderRouter);
app.use("/chatbot", chatbotRouter);

app.use((err, req, res, next) => {
    let{statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, () => {
    console.log(`app is listening on port ${8080}`);
});