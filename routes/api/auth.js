const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");

// @route - api/auth
// @access - public
// @desc - Get authenticated user

router.get("/", auth, async (req, res) => {
  const id = req.user.id;
  const getUser = await User.findById(id).select("-password");

  if (!getUser) {
    return res.status(404).send("User not found");
  }
  res.status(200).send(getUser);
});

// @route - api/auth
// @access - public
// @desc - Login user

router.post(
  "/",
  [
    check("email", "Please enter email id").isEmail(),
    check("password", "Password length should be greater than 4").exists(),
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).send({ error: error.errors });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        console.log("Invalid");
        res.status(401).send("Invalid credentials");
      }

      const verify = await bcrypt.compare(password, user.password);
      if (!verify) {
        return res.status(401).send("Invalid credentials");
      }
      const payload = {
        user: {
          id: user.id,
        },
      };

      const jwtSecret = config.get("jwtSecret");
      jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.send({
          token,
        });
      });
    } catch (e) {
      res.send(e.message);
    }
  }
);

module.exports = router;
