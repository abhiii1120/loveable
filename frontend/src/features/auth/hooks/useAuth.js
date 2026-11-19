import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { register as registerThunk, login as loginThunk } from "../state/authSlice";
import { useNavigate } from "react-router";

export let useAuth = () => {
  let {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  let dispatch = useDispatch();
  let navigate = useNavigate();
  const {isloading,error,user} = useSelector((state) => state.auth);

  const onLoginSubmit = async (data) => {
    const result = await dispatch(loginThunk(data));
    if(loginThunk.fulfilled.match(result)){
      navigate("/projects");
    }
  };

  const onRegisterSubmit = async (data) => {
    const result = await dispatch(registerThunk(data));
    if(registerThunk.fulfilled.match(result)){
      navigate("/projects");
    }
  };

  return {
    register,
    errors,
    handleSubmit,
    onLoginSubmit,
    onRegisterSubmit,
    reset,
    navigate,
    isloading,
    error,
    user
  };
};
