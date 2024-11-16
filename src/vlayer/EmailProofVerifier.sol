// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {EmailProver} from "./EmailProver.sol";

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";

contract EmailProofVerifier is Verifier {
    address public prover;
    mapping(string => uint256) public credits;

    constructor(address _prover) {
        prover = _prover;
    }

    function _parseUint(string memory str) internal pure returns (uint256) {
        bytes memory b = bytes(str);
        uint256 result = 0;
        for (uint i = 0; i < b.length; i++) {
            uint8 c = uint8(b[i]);
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
        return result;
    }

    function verify(
        Proof calldata,
        string memory username,
        string memory credit
    ) public onlyVerified(prover, EmailProver.main.selector) {
        uint256 amount = _parseUint(credit);
        credits[username] = amount;
    }

    function getCredit(string memory username) public view returns (uint256) {
        return credits[username];
    }
}
