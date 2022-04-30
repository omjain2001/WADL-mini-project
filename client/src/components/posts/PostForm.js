import React, { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { addPost } from "../../actions/post";

const PostForm = ({ addPost }) => {
  const [text, setText] = useState("");
  const onChange = (e) => {
    setText({ ...text, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    addPost(text);
  };
  return (
    <div class="post-form">
      <div class="bg-primary p">
        <h3>Say Something...</h3>
      </div>
      <form class="form my-1" onSubmit={onSubmit}>
        <textarea
          name="text"
          cols="30"
          rows="5"
          placeholder="Create a post"
          required
          onChange={onChange}
        ></textarea>
        <input type="submit" class="btn btn-dark my-1" value="Submit" />
      </form>
    </div>
  );
};

PostForm.propTypes = {
  addPost: PropTypes.func.isRequired,
};

export default connect(null, { addPost })(PostForm);
