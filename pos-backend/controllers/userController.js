const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");


// ================= REGISTER =================
const register = async (req, res, next) => {
  try {
    const { name, phone, email, password, role } = req.body;

    console.log("REGISTER REQUEST:", req.body); // 🔥 DEBUG

    if (!name || !phone || !email || !password || !role) {
      return next(createHttpError(400, "All fields are required!"));
    }

    const isUserPresent = await User.findOne({ email });
    console.log("USER EXISTS CHECK:", isUserPresent); // 🔥 DEBUG

    if (isUserPresent) {
      return next(createHttpError(400, "User already exist!"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("HASHED PASSWORD:", hashedPassword); // 🔥 DEBUG

    const newUser = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    console.log("USER SAVED:", newUser); // 🔥 DEBUG

    res.status(201).json({
      success: true,
      message: "New user created!",
      data: newUser,
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error); // 🔥 DEBUG
    next(error);
  }
};


// ================= LOGIN =================
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log("\n====== LOGIN DEBUG START ======");

    if (!email || !password) {
      console.log("Missing email/password");
      return next(createHttpError(400, "All fields are required!"));
    }

    console.log("Entered Email:", email);
    console.log("Entered Password:", password);

    const user = await User.findOne({ email });

    console.log("USER FROM DB:", user); // 🔥 MOST IMPORTANT LINE

    if (!user) {
      console.log("User NOT found in DB ❌");
      return next(createHttpError(401, "Invalid Credentials"));
    }

    console.log("DB Stored Password:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password Match Result:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch ❌");
      return next(createHttpError(401, "Invalid Credentials"));
    }

    console.log("Login SUCCESS ✅");

    const accessToken = jwt.sign(
      { _id: user._id },
      config.accessTokenSecret,
      { expiresIn: "1d" }
    );

    console.log("====== LOGIN DEBUG END ======\n");

    res.status(200).json({
      success: true,
      message: "User login successfully!",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error); // 🔥 DEBUG
    next(error);
  }
};


// ================= GET USER =================
const getUserData = async (req, res, next) => {
  try {
    console.log("GET USER ID:", req.user?._id); // 🔥 DEBUG

    const user = await User.findById(req.user._id);

    console.log("FETCHED USER:", user); // 🔥 DEBUG

    res.status(200).json({ success: true, data: user });

  } catch (error) {
    console.log("GET USER ERROR:", error);
    next(error);
  }
};


// ================= LOGOUT =================
const logout = async (req, res, next) => {
  try {
    console.log("LOGOUT CALLED"); // 🔥 DEBUG

    res.clearCookie("accessToken");

    res.status(200).json({
      success: true,
      message: "User logout successfully!",
    });

  } catch (error) {
    console.log("LOGOUT ERROR:", error);
    next(error);
  }
};

module.exports = { register, login, getUserData, logout };