// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {EmailProver} from "./EmailProver.sol";

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";

contract EmailProofVerifier is Verifier {
    address public prover;
    mapping(string => uint256) public repoIssues;

    constructor(address _prover) {
        prover = _prover;
    }

    function verify(
        Proof calldata,
        string memory repoName,
        uint256 issueNumber
    ) public onlyVerified(prover, EmailProver.main.selector) {
        repoIssues[repoName] = issueNumber;
    }

    function getRepoIssues(
        string memory repoName
    ) public view returns (uint256) {
        return repoIssues[repoName];
    }
}
