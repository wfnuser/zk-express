// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Strings} from "@openzeppelin-contracts-5.0.1/utils/Strings.sol";
import {console} from "forge-std/console.sol";

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Prover} from "vlayer-0.1.0/Prover.sol";
import {RegexLib} from "vlayer-0.1.0/Regex.sol";
import {VerifiedEmail, UnverifiedEmail, EmailProofLib} from "vlayer-0.1.0/EmailProof.sol";

import {AddressParser} from "./utils/AddressParser.sol";

interface IExample {
    function exampleFunction() external returns (uint256);
}

contract EmailProver is Prover {
    using Strings for string;
    using RegexLib for string;
    using AddressParser for string;
    using EmailProofLib for UnverifiedEmail;

    event LogString(string label, string value);

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

    function main(
        UnverifiedEmail calldata unverifiedEmail
    ) public returns (Proof memory, string memory, uint256) {
        VerifiedEmail memory email = unverifiedEmail.verify();

        // capture subject to get repo name and issue number
        // for example:
        // [YoubetDao-Test/test-tutorial-scroll-1] test-issue-for-zk-email-2
        // (Issue #41)
        string[] memory captures = email.subject.capture(
            "^\\[(.*?)\\].*\\(Issue #([0-9]+)\\)$"
        );

        require(captures.length == 3, "Invalid subject format");

        return (
            proof(),
            captures[1], // repo name
            _parseUint(captures[2]) // issue number
        );
    }
}
