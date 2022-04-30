const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const request = require("request");
const config = require("config");

// @route - api/profile/me
// @access - private
// @desc - Get logged in profile

router.get("/me", auth, async (req, res) => {
  const getProfile = await Profile.findOne({
    user: req.user.id,
  }).populate("user", ["name", "avatar"]);

  if (!getProfile) {
    return res.status(404).send("User profile not found !!");
  }
  res.status(200).send(getProfile);
});

// @route - api/profile
// @access - public
// @desc - get all profiles

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    if (!profiles) {
      return res.status(404).send("No profiles");
    }
    res.status(200).send(profiles);
  } catch (e) {
    res.status(404).json("Server error");
  }
});

// @route - api/profile/user/:user_id
// @access - public
// @desc - Get user profile by user_id

router.get("/user/:user_id", async (req, res) => {
  try {
    const profiles = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profiles) {
      return res.status(404).send("No profiles");
    }
    res.status(200).send(profiles);
  } catch (e) {
    if (e.kind == "ObjectId") {
      return res.status(404).send("Profile not found");
    }
    res.status(400).json({ msg: "Server error" });
  }
});

// @route - api/profile
// @access - private
// @desc - Build/Update a profile

router.post(
  "/",
  [
    auth,
    [
      check("skills", "Please mention your skills").not().isEmpty(),
      check("status", "Please mention your status").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(401).send({ error: error.errors });
    }
    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubUsername,
      youtube,
      facebook,
      twitter,
      linkedin,
      instagram,
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    profileFields.status = status;
    profileFields.skills = skills.split(",").map((skill) => skill.trim());

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (githubUsername) profileFields.githubUsername = githubUsername;

    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;

    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      const updatedProfile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.status(200).json(updatedProfile);
    }

    try {
      const newProfile = new Profile(profileFields);
      await newProfile.save();
      res.status(200).json(newProfile);
    } catch (e) {
      res.status(400).json("Server Error");
    }
  }
);

// @route - api/profile
// @access - private
// @desc - Delete profile,posts,user

router.delete("/", auth, async (req, res) => {
  try {
    // Remove user posts
    await Post.deleteMany({ user: req.user.id });

    // Remove user profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.status(200).send("User deleted");
  } catch (e) {
    if (e.kind == "ObjectId") {
      return res.status(404).send("Profle not found");
    }
    res.status(400).json({ msg: "Server error" });
  }
});

// @route - PUT api/profile/experience
// @access - private
// @desc - Add experience to a logged in user

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Provide the title").not().isEmpty(),
      check("company", "Provide company name").not().isEmpty(),
      check("from", "Provide from date").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ msg: "Profile not found !!" });
    }

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      profile.experience.unshift(newExp);
      await profile.save();
      res.status(200).json(profile);
    } catch (e) {
      return res.status(400).send("Server error");
    }
  }
);

// @route - DELETE api/profile/experience
// @access - private
// @desc - delete experience to a logged in user
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ msg: "Profile not found !!" });
    }

    const expIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(expIndex, 1);

    await profile.save();
    res.status(200).send(profile);
  } catch (e) {
    return res.status(400).send("Server error");
  }
});

// @route - PUT api/profile/education
// @access - private
// @desc - Add education to a logged in user

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("from", "From is required").not().isEmpty(),
      check("fieldOfStudy", "Field of study is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ msg: "Profile not found !!" });
    }

    const newEdu = {
      school,
      degree,
      fieldOfStudy,
      from,
      to,
      current,
      description,
    };

    try {
      profile.education.unshift(newEdu);
      await profile.save();
      res.status(200).json(profile);
    } catch (e) {
      return res.status(400).send("Server error");
    }
  }
);

// @route - DELETE api/profile/education/edu_id
// @access - private
// @desc - delete education to a logged in user
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ msg: "Profile not found !!" });
    }

    const eduIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(eduIndex, 1);

    await profile.save();
    res.status(200).send(profile);
  } catch (e) {
    return res.status(400).send("Server error");
  }
});

// @route - GET api/profile/github/:username
// @access - public
// @desc - get a user's github repos
router.get("/github/:username", (req, res) => {
  const options = {
    uri: `https://api.github.com/users/${
      req.params.username
    }/repos?per_page=5&sort=created:asc&client_id=${config.get(
      "githubClientId"
    )}&client_secret=${config.get("githubClientSecret")}`,
    method: "GET",
    headers: {
      "user-agent": "node.js",
    },
  };

  request(options, (error, response, body) => {
    try {
      if (error) {
        return res.status(400).send(error);
      }

      if (response.statusCode != 200) {
        return res.status(404).send("No github profile found");
      }
      res.status(200).send(JSON.parse(body));
    } catch (e) {
      console.error(e.message);
      res.status(404).send("Server Error");
    }
  });
});

module.exports = router;
