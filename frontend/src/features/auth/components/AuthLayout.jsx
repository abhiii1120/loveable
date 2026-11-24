import { motion } from "motion/react";
import AeroShards from "@/components/AeroShards";
import AuthCards from "./AuthCards";

const container = {
  hidden: {},
  show: {
    transition: { delayChildren: 3, staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const AuthLayout = ({ children,data }) => {
  return (
    <main className="h-screen w-full flex relative items-center p-0 overflow-hidden">
      <section className="h-screen w-full bg-background items-center p-5 flex relative overflow-hidden">
        <div id="container" className="flex w-full h-full">
          <div className="hidden md:block md:w-3/5 h-full relative">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="absolute left-12 bottom-12 z-10 flex flex-col text-amber-100 pointer-events-none gap-6"
            >
              <div className="flex flex-col gap-3 items-start max-w-3/5">
                <motion.h2
                  variants={item}
                  className="text-heading font-semibold text-5xl tracking-tight"
                >
                  {data.leftSectionMainText}
                </motion.h2>
                <motion.h4
                  variants={item}
                  className="text-subtle font-semibold tracking-tight"
                >
                  {data.leftSectionSubText}
                </motion.h4>
              </div>

              <div className="grid grid-flow-col grid-cols-3 gap-4">
                {data.cardArr.map((card, idx) => (
                  <motion.div key={card.text} variants={item}>
                    <AuthCards
                      number={idx + 1}
                      text={card.text}
                      selected={card.selected}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <AeroShards
              shardColor="#b4a6f0"
              accentColor="#818cf8"
              placement="full"
              material="glass"
              markers="dots"
              count={1950}
              depthOfField={0.74}
              vignette={0.5}
              mouseInteraction
              pulseOnClick
              holdToGather
              lightMode={false}
              shardSize={1.18}
              spread={0.92}
              twist={0.79}
              billow={1.1}
              speed={0.82}
              scale={0.75}
              glow={0.56}
              grain={0.09}
              intro
              mouseStrength={0.99}
              parallax={0.43}
              paused={false}
              style={{ width: "100%", height: "100%", position: "relative" }}
              onError={() => {}}
            />
          </div>
          <div className="w-full md:w-2/5 h-full flex items-center justify-center overflow-y-auto">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;