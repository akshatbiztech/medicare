/* eslint-disable react/prop-types */
import { createContext, useEffect, useState, useReducer } from "react";
import AWS from "aws-sdk";

const initial_state = {
  user:
    localStorage.getItem("user") !== undefined
      ? JSON.parse(localStorage.getItem("user"))
      : null,
  token: localStorage.getItem("token") || "",
  role: localStorage.getItem("role") || "",
};

AWS.config.update({
  region: <Your region>,
  accessKeyId: <YOUR_KEYS>,
  secretAccessKey: <Your secret key>,
});

export const AuthContext = createContext(initial_state);

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        token: "",
        role: "",
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload.user,
        token: action.payload.token,
        role: action.payload.role,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        token: "",
        role: "",
      };

    case "LOGOUT":
      return {
        user: null,
        token: "",
        role: "",
      };

    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, initial_state);
  const [prodUrl, setProdUrl] = useState("");

  useEffect(() => {
    const fetchSecretValue = async () => {
      try {
        const secretsManager = new AWS.SecretsManager();
        const response = await secretsManager
          .getSecretValue({ SecretId: "ProdApiGatewayUrl" })
          .promise();
        setProdUrl(response.SecretString);
      } catch (error) {
        console.error("Error fetching AWS Secret value:", error);
      }
    };

    fetchSecretValue();
  }, []);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
    localStorage.setItem("token", state.token);
    localStorage.setItem("role", state.role);
  }, [state]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        role: state.role,
        PROD_URL: prodUrl,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
