import fs from "fs";
import { createVlayerClient, preverifyEmail } from "@vlayer/sdk";
import {
  getConfig,
  createContext,
  deployVlayerContracts,
} from "@vlayer/sdk/config";

import proverSpec from "../out/EmailProver.sol/EmailProver";
import verifierSpec from "../out/EmailProofVerifier.sol/EmailProofVerifier";

const mimeEmail = fs.readFileSync("./testdata/credit-email.eml").toString();
const unverifiedEmail = await preverifyEmail(mimeEmail);

const { prover, verifier } = await deployVlayerContracts({
  proverSpec,
  verifierSpec,
});

const config = getConfig();
const { chain, ethClient, account, proverUrl, confirmations } =
  await createContext(config);

console.log("Proving...");

const vlayer = createVlayerClient({
  url: proverUrl,
});

const hash = await vlayer.prove({
  address: prover,
  proverAbi: proverSpec.abi,
  functionName: "main",
  chainId: chain.id,
  args: [unverifiedEmail],
});
console.log("Proof hash:", hash);
const result = await vlayer.waitForProvingResult(hash);
console.log("Proof:", result[0]);
console.log("Email:", result[1]);
console.log("Credit:", result[2]);
console.log("BankName:", result[3]);
console.log("Verifying...");

// use ethClient to get event from prover
////////////////////////////////////////////////////////////
// while (true) {
//   const logs = await ethClient.getContractEvents({
//     address: prover,
//     abi: proverSpec.abi,
//     eventName: "LogString",
//     fromBlock: startBlock,
//     toBlock: "latest",
//   });

//   if (logs.length > 0) {
//     logs.forEach((log) => {
//       console.log(`${log.args.label}: ${log.args.value}`);
//     });
//     break; // 如果找到日志就退出循环
//   }

//   await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒
// }
////////////////////////////////////////////////////////////

const txHash = await ethClient.writeContract({
  address: verifier,
  abi: verifierSpec.abi,
  functionName: "verify",
  // args: [result[0], "qinghao@ethglobal.com", 80n, "ETH Bank"],
  args: result,
  chain,
  account: account,
});

await ethClient.waitForTransactionReceipt({
  hash: txHash,
  confirmations,
  retryCount: 60,
  retryDelay: 1000,
});

const credits = await ethClient.readContract({
  address: verifier,
  abi: verifierSpec.abi,
  functionName: "getUserCredits",
  args: ["qinghao@ethglobal.com"],
});

console.log("Get Credit From Verifier:", credits);

console.log("Verified!");
