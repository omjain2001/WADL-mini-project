const express = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const config = require("config");
const jwt = require("jsonwebtoken");
const router = express.Router();

// @route - api/user
// @access - public
// @desc - Register new user

router.post(
  "/",
  [
    check("name", "Please enter username").not().isEmpty(),
    check("email", "Please enter email id").isEmail(),
    check("password", "Password length should be greater than 4").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).send({ error: error.errors });
    }

    const { name, email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (user) {
        return res.status(400).send("User already exist");
      }

      const salt = await bcrypt.genSalt(10);
      const Encrypt = await bcrypt.hash(password, salt);

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      const newUser = new User({
        name,
        email,
        password: Encrypt,
        avatar,
      });

      await newUser.save();

      const payload = {
        user: {
          id: newUser.id,
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
