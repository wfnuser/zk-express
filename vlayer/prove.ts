import fs from "fs";
import { createVlayerClient, preverifyEmail } from "@vlayer/sdk";
import {
  getConfig,
  createContext,
  deployVlayerContracts,
} from "@vlayer/sdk/config";

import proverSpec from "../out/EmailProver.sol/EmailProver";
import verifierSpec from "../out/EmailProofVerifier.sol/EmailProofVerifier";

const mimeEmail = fs
  .readFileSync("./testdata/github-open-issue.eml")
  .toString();
const unverifiedEmail = await preverifyEmail(mimeEmail);

const { prover, verifier } = await deployVlayerContracts({
  proverSpec,
  verifierSpec,
});

console.log("Prover:", prover);
console.log("Verifier:", verifier);

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
console.log("Repo:", result[1]);
console.log("Issue Number:", result[2]);
console.log("Verifying...");

const txHash = await ethClient.writeContract({
  address: verifier,
  abi: verifierSpec.abi,
  functionName: "verify",
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

const repoIssues = await ethClient.readContract({
  address: verifier,
  abi: verifierSpec.abi,
  functionName: "getRepoIssues",
  args: ["YoubetDao-Test/test-tutorial-scroll-1"],
});

console.log("Get Repo Issue Number From Verifier:", repoIssues);

console.log("Verified!");
