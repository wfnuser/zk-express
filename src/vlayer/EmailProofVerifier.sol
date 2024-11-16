// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {EmailProver} from "./EmailProver.sol";

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";

contract EmailProofVerifier is Verifier {
    address public prover;
    mapping(string => string[]) public userBanks;
    mapping(string => uint256[]) public userCredits;

    constructor(address _prover) {
        prover = _prover;
    }

    function verify(
        Proof calldata,
        string memory userEmail,
        uint256 creditValue,
        string memory bankName
    ) public onlyVerified(prover, EmailProver.main.selector) {
        for (uint i = 0; i < userBanks[userEmail].length; i++) {
            if (
                keccak256(bytes(userBanks[userEmail][i])) ==
                keccak256(bytes(bankName))
            ) {
                userCredits[userEmail][i] = creditValue;
                return;
            }
        }
        userBanks[userEmail].push(bankName);
        userCredits[userEmail].push(creditValue);
    }

    function getUserCredits(
        string memory userEmail
    ) public view returns (string[] memory banks, uint256[] memory credits) {
        return (userBanks[userEmail], userCredits[userEmail]);
    }
}
