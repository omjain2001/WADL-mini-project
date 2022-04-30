const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const User = require("../../models/User");
const auth = require("../../middlewares/auth");
const { check, validationResult } = require("express-validator");

// @route - POST api/posts
// @desc - Create a post
// @access - Private

router.post(
  "/",
  [auth, [check("text", "Text is required !!").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array());
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        user: req.user.id,
        name: user.name,
        text: req.body.text,
        avatar: user.avatar,
      });

      await newPost.save();

      res.status(200).send(newPost);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ Error: "Server Error" });
    }
  }
);

// @route - GET api/posts
// @desc - Get all post
// @access - Private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: "-1" });
    if (!posts) {
      return res.status(404).json({ Error: "Posts not found" });
    }

    res.status(200).send(posts);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ Error: "Server error" });
  }
});

// @route - GET api/posts/:id
// @desc - Get particular post
// @access - Private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ Error: "Posts not found" });
    }

    res.status(200).send(post);
  } catch (e) {
    console.error(e.message);
    if (e.kind == "ObjectId") {
      return res.status(404).send("Incorrect id");
    }
    res.status(500).json({ Error: "Server error" });
  }
});

// @route - DELETE api/posts/:id
// @desc - Delete particular post
// @access - Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(400).send("Only owner can delete this post");
    }

    await post.remove();
    res.status(200).send("Deleted successfully !!");
  } catch (e) {
    if (e.kind == "ObjectId") {
      return res.status(404).send("Incorrect id");
    }
    res.status(500).json({ Error: "Server error" });
  }
});

// @route - PUT api/posts/like/:id
// @desc - Like particular post
// @access - Private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).send("Post already liked");
    }
    post.likes.unshift({ user: req.user.id });

    await post.save();
    res.status(200).send(post.likes);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

// @route - PUT api/posts/unlike/:id
// @desc - Unlike particular post
// @access - Private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).send("Post not yet liked");
    }

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.status(200).send(post.likes);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

// @route - POST api/posts/comment/:id
// @desc - Post a comment
// @access - Private

router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required !!").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send(errors.array());
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        user: req.user.id,
        name: user.name,
        text: req.body.text,
        avatar: user.avatar,
      };

      post.comments.unshift(newComment);
      await post.save();

      res.status(200).send(post.comments);
    } catch (e) {
      console.error(e.message);
      res.status(500).json({ Error: "Server Error" });
    }
  }
);

// @route - DELETE api/posts/:post_id/comment/:comment:id
// @desc - Delete a comment
// @access - Private

router.delete("/:post_id/comment/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    const comment = post.comments.find(
      (msg) => msg.id.toString() === req.params.comment_id
    );

    if (!comment) {
      return res.status(404).send("Comment not found !!");
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(404).send("Only comment owner can delete this comment");
    }

    const removeIndex = post.comments
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();

    res.status(200).send(post.comments);
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ Error: "Server Error" });
  }
});

module.exports = router;
