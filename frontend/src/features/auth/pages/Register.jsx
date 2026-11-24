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

const AuthLayoutData = {
  leftSectionMainText: "Your next big idea starts here.",
  leftSectionSubText:
    "From a simple idea to a fully functional application. Start building smarter, faster, and without limits.",
  cardArr: [
    { text: "Create your account", selected: true },
    { text: "Share your idea with AI", selected: false },
    { text: "Bring your vision to life", selected: false },
  ],
};

const Register = () => {
  let { errors, handleSubmit, onRegisterSubmit, register, navigate } = useAuth();

  return (
    <AuthLayout data={AuthLayoutData}>
      <div className="h-full w-full p-12 flex flex-col gap-4 items-center justify-center">
        <motion.form
          variants={container}
          initial="hidden"
          animate="show"
          onSubmit={handleSubmit(onRegisterSubmit)}
          className="flex flex-col gap-6 max-w-120"
        >
          <motion.div variants={item} className="flex flex-col gap-2">
            <h1 className="text-heading text-3xl">Start building today.</h1>
            <p className="text-subtle text-sm max-w-4/5">
              Create your account and turn your ideas into reality.
            </p>
          </motion.div>

          <motion.div variants={item}>
            <Input
              id="name"
              type="text"
              label="Username"
              placeholder="John doe"
              error={errors.name?.message}
              {...register("name", {
                required: "name is required",
              })}
            />
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
                  value: 8,
                  message: "Password must be at least 8 characters",
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
          Already have an account?
          <span
            onClick={() => navigate("/")}
            className="hover:text-heading hover:underline cursor-pointer"
          >
            Login
          </span>
        </motion.p>
      </div>
    </AuthLayout>
  );
};

export default Register;