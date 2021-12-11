const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const ejs = require("ejs");
const mongodbSession = require("connect-mongodb-session")(session);
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const registerModel = require("./model/register");
const bcrypt = require("bcryptjs");
const app = express();
const mongoUrl = "mongodb://localhost:27017/secssion";
const port = 3000;

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then((data) => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("Error from database", err);
  });
const store = new mongodbSession({
  uri: mongoUrl,
  collection: "mycollection",
});
// here we pass all the incoming request in (req.body{ })
app.use(bodyparser.urlencoded({ extended: true }));
// here we set view engine
app.set("view engine", "ejs");

app.use(
  session({
    secret: "key that will assign cookies",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
// for flash message...
app.use(flash());
// for authentication
const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};
app.get("/", (req, res) => {
  res.render("landing");
});
// for login
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await registerModel.findOne({ email });
    if (!user) {
      res.redirect("/login");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.redirect("/login");
    }
    req.session.isAuth = true;
    res.redirect("/dashboard");
  } catch (err) {
    console.log(`Error from Login post ${err}`);
  }
});
// for register
app.get("/register", (req, res) => {
  res.render("register", { message: req.flash("Warning") });
});
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("it is show req.body ", req.body);
    let user = await registerModel.findOne({ email });
    console.log("it is show user ", user);

    if (user) {
      req.flash("Warning", "Info! Email is Already Exist");
      return res.redirect("/register");
    }

    console.log("encrypt section", password);

    const encryptPassword = await bcrypt.hash(password, 10);
    console.log("show encrypted pass ", encryptPassword);
    user = new registerModel({
      name,
      email,
      password: encryptPassword,
    });
    console.log("show user data before save ", user);
    await user.save();
    res.redirect("/login");
    console.log("Data added successfully ");
  } catch (err) {
    console.log(`Error form RegisterModel ${err}`);
  }
});
// for dashboard
app.get("/dashboard", isAuth, (req, res) => {
  res.render("dashbord");
});
// /////////// Logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw err;
    } else {
      res.redirect("/");
    }
  });
});

app.listen(port, (req, res) => {
  console.log(`Server listening at ${port}`);
});
