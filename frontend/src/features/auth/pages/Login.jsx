import React from "react";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  let { errors, handleSubmit, onLoginSubmit, register } = useAuth();
  return (
    <div>
      <form onSubmit={handleSubmit(onLoginSubmit)}>
        <input
          type="text"
          {...register("email", { required: "email is required" })}
        />
        <br />
        <input
          type="text"
          {...register("password", { required: "password is required" })}
        />
        <p>{errors.email?.message}</p>
        <button type="submit">submit</button>
      </form>
    </div>
  );
};

export default Login;
