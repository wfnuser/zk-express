import { useState } from "react";
import { motion } from "framer-motion";
import { useContractRead } from "wagmi";
import { VERIFIER_ABI, VERIFIER_ADDRESS } from "../config/constants";

export default function RepoBattle() {
  const [repo1] = useState("YoubetDao/repo-1");
  const [repo2] = useState("YoubetDao/repo-2");

  const { data: issueCount1 } = useContractRead({
    address: VERIFIER_ADDRESS,
    abi: VERIFIER_ABI,
    functionName: "getRepoIssues",
    args: [repo1],
  });

  const { data: issueCount2 } = useContractRead({
    address: VERIFIER_ADDRESS,
    abi: VERIFIER_ABI,
    functionName: "getRepoIssues",
    args: [repo2],
  });

  const count1 = Number(issueCount1 ?? 0);
  const count2 = Number(issueCount2 ?? 0);
  const total = count1 + count2;
  const percentage = total === 0 ? 50 : (count1 / total) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-16">
          Repository Battle
        </h1>

        <div className="flex justify-between items-center gap-8 mb-12">
          {/* Left Repo */}
          <motion.div
            className="flex-1 bg-gray-800/50 backdrop-blur rounded-lg p-8"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4">{repo1}</h2>
            <div className="text-6xl font-bold text-blue-500">{count1}</div>
            <div className="mt-4 text-gray-400">Issues</div>
          </motion.div>

          {/* VS Badge */}
          <motion.div
            className="text-4xl font-bold bg-red-500 rounded-full p-4 z-10"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            VS
          </motion.div>

          {/* Right Repo */}
          <motion.div
            className="flex-1 bg-gray-800/50 backdrop-blur rounded-lg p-8"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4">{repo2}</h2>
            <div className="text-6xl font-bold text-green-500">{count2}</div>
            <div className="mt-4 text-gray-400">Issues</div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-4 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500"
            style={{
              backgroundSize: "200% 100%",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute top-0 bottom-0 right-0 bg-gray-800/50 backdrop-blur"
            initial={{ width: "50%" }}
            animate={{ width: `${100 - percentage}%` }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          />

          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 blur-lg"
            style={{
              backgroundSize: "200% 100%",
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </div>

        {/* Score Display */}
        <motion.div
          className="text-center mt-6 text-xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {percentage.toFixed(1)}% vs {(100 - percentage).toFixed(1)}%
        </motion.div>
      </div>
    </div>
  );
}
