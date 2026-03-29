const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");


// ================= REGISTER =================
const register = async (req, res, next) => {
  try {
    const { name, phone, email, password, role } = req.body;

    if (!name || !phone || !email || !password || !role) {
      return next(createHttpError(400, "All fields are required!"));
    }

    const isUserPresent = await User.findOne({ email });
    if (isUserPresent) {
      return next(createHttpError(400, "User already exist!"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    // 🔥 DEBUG (REGISTER)
    console.log("SAVED USER EMAIL:", newUser.email);

    res.status(201).json({
      success: true,
      message: "New user created!",
      data: newUser,
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error); // optional debug
    next(error);
  }
};


// ================= LOGIN =================
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createHttpError(400, "All fields are required!"));
    }

    const user = await User.findOne({ email });

    // 🔥 DEBUG (LOGIN)
    console.log("LOGIN EMAIL:", email);
    console.log("USER FROM DB:", user);

    if (!user) {
      return next(createHttpError(401, "Invalid Credentials"));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // 🔥 DEBUG
    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return next(createHttpError(401, "Invalid Credentials"));
    }

    const accessToken = jwt.sign(
      { _id: user._id },
      config.accessTokenSecret,
      { expiresIn: "1d" }
    );

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
    console.log("LOGIN ERROR:", error); // optional debug
    next(error);
  }
};


// ================= GET USER =================
const getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};


// ================= LOGOUT =================
const logout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken");
    res.status(200).json({
      success: true,
      message: "User logout successfully!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getUserData, logout };