import React, { Fragment, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getGithubRepos } from "../../actions/profile";

const ProfileGithubRepos = ({
  getGithubRepos,
  profile: { githubUsername },
  repos,
}) => {
  useEffect(() => {
    if (githubUsername) {
      getGithubRepos(githubUsername);
    }
  }, [getGithubRepos]);
  return (
    <Fragment>
      {repos !== null && repos.length > 0 ? (
        <Fragment>
          {repos.map((repo) => (
            <div class="repo bg-white p-1 my-1" key={repo.id}>
              <div>
                <h4>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repo.name}
                  </a>
                </h4>
                <p>{repo.description}</p>
              </div>
              <div>
                <ul>
                  <li class="badge badge-primary">
                    Stars: {repo.stargazers_count}
                  </li>
                  <li class="badge badge-dark">
                    Watchers: {repo.watchers_count}
                  </li>
                  <li class="badge badge-light">Forks: {repo.forks_count}</li>
                </ul>
              </div>
            </div>
          ))}
        </Fragment>
      ) : (
        <span>No Github repos</span>
      )}
    </Fragment>
  );
};

ProfileGithubRepos.propTypes = {
  getGithubRepos: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  repos: PropTypes.array.isRequired,
};

export default connect(null, { getGithubRepos })(ProfileGithubRepos);
