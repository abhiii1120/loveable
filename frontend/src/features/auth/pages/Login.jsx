import React from "react";
import { motion } from "motion/react";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 2.25 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut"},
  },
};

const Login = () => {
  let { errors, handleSubmit, onLoginSubmit, register, navigate } = useAuth();

  return (
    <AuthLayout>
      <div className="h-full w-full p-12 flex flex-col gap-4 items-center justify-center">
        <motion.form
          variants={container}
          initial="hidden"
          animate="show"
          onSubmit={handleSubmit(onLoginSubmit)}
          className="flex flex-col gap-6 max-w-120"
        >
          <motion.div variants={item} className="flex flex-col gap-2 max-w-3/5">
            <h1 className="text-heading text-3xl">Start a project</h1>
            <p className="text-subtle text-sm">
              Tell us what you're building. We usually reply within two business days.
            </p>
          </motion.div>

          <motion.div variants={item}>
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
          </motion.div>

          <motion.div variants={item}>
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
          </motion.div>

          <motion.div variants={item}>
            <Button type="submit" className="mt-2">
              Continue
            </Button>
          </motion.div>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 , y:20}}
          animate={{ opacity: 1 ,y:0}}
          transition={{ delay: 2.75}}
          className="text-sm text-subtle gap-1 flex "
        >
          don't have an account?
          <span
            onClick={() => navigate("/register")}
            className="hover:text-heading hover:underline cursor-pointer"
          >
            Signup
          </span>
        </motion.p>
      </div>
    </AuthLayout>
  );
};

export default Login;