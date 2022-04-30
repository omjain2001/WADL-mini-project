import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";

class Landing extends Component {
  render() {
    if (this.props.isAuthenticated) {
      return <Redirect to="/dashboard" />;
    }

    return (
      <section class="landing">
        <div class="dark-overlay">
          <div class="landing-inner">
            <h1 class="x-large"></h1>
            <p class="lead">
              Create a developer profile/portfolio, share posts and get help
              from other developers
            </p>
            <div class="buttons">
              <Link to="/register" class="btn btn-primary">
                Sign Up
              </Link>
              <Link to="/login" class="btn btn-light">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

Landing.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Landing);
