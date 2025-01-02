const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// register controller
const registerUser = async (req, res) => {
  try {
    //extract user information from request body
    const { username, email, password, role } = req.body;

    //check if user already exist in the db
    const checkUserExist = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (checkUserExist) {
      return res.status(400).json({
        success: false,
        message:
          "username or email already exist! Please try with different username or email",
      });
    }

    //hash user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create a new user and save in your database
    const newlyCreatedUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newlyCreatedUser.save();

    if (newlyCreatedUser) {
      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Unable to register user! Please try again",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
};

//login controller
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    //find if current user exist in the database or not
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User doesn't exist",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    //create user token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "15m",
      }
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      accessToken,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
};

const changePassword = async(req, res) => {
  try{
    const userId = req.userInfo.userId;

    //extract new and old password 
    const {oldPassword, newPassword} = req.body;

    //find the current logged in user
    const user = await User.findById(userId);

    if(!user){
      return res.status(400).json({
        success: false,
        message: "User not found"
      })
    }

    //check if old password correct
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if(!isPasswordMatch){
      return res.status(400).json({
        success: false,
        message: "Old password is not correct! Please try again"
      })
    }

    //hash the new password
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    //update user password
    user.password = newHashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    })

  }catch(error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured! Please try again",
    });
  }
}

module.exports = {
  loginUser,
  registerUser,
  changePassword
};
