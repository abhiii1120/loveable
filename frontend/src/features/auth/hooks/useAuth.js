import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addUser } from "../state/authSlice";
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

  const onLoginSubmit = async (data) => {
    console.log(data);
    dispatch(addUser(data))
  };

  const onRegisterSubmit = async (data) => {
    console.log(data);
    dispatch(addUser(data));
  };

  return {
    register,
    errors,
    handleSubmit,
    onLoginSubmit,
    onRegisterSubmit,
    reset,
    navigate,
  };
};
