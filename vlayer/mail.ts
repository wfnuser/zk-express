// watch ../mailbot/mails/
// prove the email and verify the proof
// address of prover and verifier are in .env.dev
import fs from "fs";
import { createVlayerClient, preverifyEmail } from "@vlayer/sdk";
import { getConfig, createContext } from "@vlayer/sdk/config";

import proverSpec from "../out/EmailProver.sol/EmailProver";
import verifierSpec from "../out/EmailProofVerifier.sol/EmailProofVerifier";

async function proofAndVerify(mimeEmail: string) {
  const unverifiedEmail = await preverifyEmail(mimeEmail);

  const prover = process.env.PROVER;
  const verifier = process.env.VERIFIER;

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
    args: ["YoubetDao-Test/test-optimistic-tutorial"],
  });

  console.log("Get Repo Issue Number From Verifier:", repoIssues);

  console.log("Verified!");
}

const repoFetchedIssueNumber = new Map<string, number>();

async function main() {
  while (true) {
    const files = fs.readdirSync("../mailbot/mails/").reverse();
    // reverse the files to prove the latest email first
    files.sort((a, b) => Number(b.split(".")[0]) - Number(a.split(".")[0]));
    for (const file of files) {
      const body = fs.readFileSync(`../mailbot/mails/${file}`).toString();
      // [YoubetDao-Test/test-tutorial-scroll-1] test-issue-for-zk-email-2
      // (Issue #41)
      // capture Issue Number and repo name
      if (!body.includes("Subject: [YoubetDao-Test/")) {
        continue;
      }
      try {
        const repoName = body.split("Subject: [")[1].split("]")[0];
        const issueNumber = body.split("Issue #")[1].split(")")[0];
        if (
          (repoFetchedIssueNumber.get(repoName) ?? 0) >= Number(issueNumber)
        ) {
          continue;
        }
        await proofAndVerify(body);
        repoFetchedIssueNumber.set(repoName, Number(issueNumber));
        // wait 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (e) {
        console.log(e);
      }
    }
  }
}

main();
