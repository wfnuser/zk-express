export const VERIFIER_ADDRESS =
  "0x959922be3caee4b8cd9a407cc3ac1c251c2007b1" as `0x${string}`;

export const VERIFIER_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "repoName",
        type: "string",
      },
    ],
    name: "getRepoIssues",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
