import React, { Fragment, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { getProfileById } from "../../actions/profile";
import Spinner from "../layouts/Spinner";
import ProfileTop from "./ProfileTop";
import ProfileAbout from "./ProfileAbout";
import ProfileExperience from "./ProfileExperience";
import ProfileEducation from "./ProfileEducation";
import ProfileGithubRepos from "./ProfileGithubRepos";

const Profile = ({
  getProfileById,
  auth,
  profile: { profile, loading, repos },
  match,
}) => {
  useEffect(() => {
    getProfileById(match.params.id);
  }, [getProfileById]);
  return (
    <Fragment>
      {loading || profile === null ? (
        <Spinner />
      ) : (
        <Fragment>
          <Link to="/profiles" className="btn btn-light">
            Back to profiles
          </Link>
          {auth.isAuthenticated && auth.user._id === profile.user._id && (
            <Fragment>
              <Link to="/edit-profile" className="btn btn-dark">
                Edit Profile
              </Link>
            </Fragment>
          )}
          <div className="profile-grid my-1">
            <ProfileTop profile={profile} />
            <ProfileAbout profile={profile} />
            <div class="profile-exp bg-white p-2">
              <h2 class="text-primary">Experience</h2>
              {profile.experience.length > 0 ? (
                <Fragment>
                  {profile.experience.map((exp) => (
                    <ProfileExperience key={exp._id} experience={exp} />
                  ))}
                </Fragment>
              ) : (
                <h3>No experience credentials</h3>
              )}
            </div>
            <div class="profile-edu bg-white p-2">
              <h2 class="text-primary">Education</h2>
              {profile.education.length > 0 ? (
                <Fragment>
                  {profile.education.map((edu) => (
                    <ProfileEducation key={edu._id} education={edu} />
                  ))}
                </Fragment>
              ) : (
                <h3>No education credentials</h3>
              )}
            </div>
          </div>
          <div class="profile-github">
            <h2 class="text-primary my-1">
              <i class="fab fa-github"></i> Github Repos
            </h2>
            <ProfileGithubRepos profile={profile} repos={repos} />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

Profile.propTypes = {
  getProfileById: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  profile: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  profile: state.profile,
});

export default connect(mapStateToProps, { getProfileById })(Profile);
