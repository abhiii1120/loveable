import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";

const Register = () => {
  let { errors, handleSubmit, onRegisterSubmit, register } = useAuth();
  let navigate = useNavigate()
  return (
    <div>
      <form onSubmit={handleSubmit(onRegisterSubmit)}>
        <input type="email" name="" id="" {...register("email",{required:"Email is required"})} />
        <br />
        <input type="text" {...register("password",{required:"password is required"})} />
        <br />
        <p onClick={() => navigate('/')}>login</p>
        <button type="submit">submit</button>
      </form>
    </div>
  );
};

export default Register;
