const User = require("../models/User");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const token = user.getSignedJwtToken();
 
    const cookieOptions = getCookieOption();
    return res.status(200).cookie("token", token, cookieOptions).json({ success: true, token: token });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
    console.log(err.stack);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: true, message: "Please provide an email and password" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentails" });
  }

  const token = user.getSignedJwtToken();
  const cookieOptions = getCookieOption();
  return res.status(200).cookie("token", token, cookieOptions).json({
    success: true,
    //add for frontend
    _id: user._id,
    name: user.name,
    email: user.email,
    //end for frontend,
    token,
  });
};

const getCookieOption = () => {
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_JWT_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: false,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  return options;
};

exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};

exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
};
