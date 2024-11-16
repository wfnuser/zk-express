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

    function main(
        UnverifiedEmail calldata unverifiedEmail
    ) public returns (Proof memory, string memory, string memory) {
        VerifiedEmail memory email = unverifiedEmail.verify();

        // Hi, Qinghao. Your Credit is 80!
        string[] memory captures = email.subject.capture(
            "^Hi, ([^.]+). Your Credit is ([0-9]{2})!$"
        );
        
        require(
            captures.length == 3,
            "subject must match the expected pattern"
        );

        return (proof(), captures[1], captures[2]);
    }
}
