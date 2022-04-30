import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_PROFILE,
} from "../actions/types";
import { axiosInstance as axios } from "../utility/setAuthToken";
import setAuthToken from "../utility/setAuthToken";

export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get("/api/auth");
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (e) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

// Register user
export const register =
  ({ name, email, password }) =>
  async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const body = JSON.stringify({
      name,
      email,
      password,
    });

    try {
      const res = await axios.post("/api/user", body, config);

      if (res.data) {
        dispatch({ type: REGISTER_SUCCESS, payload: res.data });
        dispatch(loadUser());
      }
    } catch (e) {
      dispatch({ type: REGISTER_FAIL });
    }
  };

export const login = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify({
    email,
    password,
  });

  try {
    console.log("before");
    const res = await axios.post("/api/auth", body, config);

    if (res.data) {
      dispatch({ type: LOGIN_SUCCESS, payload: res.data });
      dispatch(loadUser());
    }
  } catch (e) {
    dispatch({ type: LOGIN_FAIL });
  }
};

export const logout = () => (dispatch) => {
  dispatch({
    type: LOGOUT,
  });

  dispatch({
    type: CLEAR_PROFILE,
  });
};
