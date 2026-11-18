import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addUser } from "../state/authSlice";

export let useAuth = () => {
  let {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  let dispatch = useDispatch();

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
  };
};
