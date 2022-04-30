import React from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";

const ProfileEducation = ({
  education: { school, degree, fieldOfStudy, from, to, description },
}) => (
  <div>
    <h3>{school}</h3>
    <p>
      <Moment format="DD/MM/YYYY">{from}</Moment> -{" "}
      {!to ? <span>Present</span> : <Moment format="DD/MM/YYYY">{to}</Moment>}
    </p>
    <p>
      <strong>Degree: </strong>
      {degree}
    </p>
    <p>
      <strong>Field Of Study: </strong>
      {fieldOfStudy}
    </p>
    <p>
      <strong>Description: </strong>
      {!description ? <span>No description</span> : { description }}
    </p>
  </div>
);

ProfileEducation.propTypes = {
  education: PropTypes.object.isRequired,
};

export default ProfileEducation;
