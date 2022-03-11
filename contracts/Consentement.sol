// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Consentement {
    address owner;
    struct UserInfo{
        string Nom;
        string Prenom;
        string mailAdresse;
        bool answere;
    }

    event Return (UserInfo person);
    mapping(uint256 => UserInfo) AllUsers;

    //constructor sets the creator of the contract to the owner variable
    constructor() {
      owner = msg.sender;
    }
    
    //modifier checks that the caller of the function is the owner
    modifier onlyOwner() {
         require(msg.sender == owner, "Not Owner");
         _;
    }

    //Set a new person on the blockchain
    function SetUserInfo(uint256 id, string memory nom, string memory prenom, string memory mailAdresse, bool answere) public onlyOwner{
        UserInfo memory person = UserInfo(nom, prenom, mailAdresse, answere);
        AllUsers[id] = person;
    }

    //Get a new person on the blockchain
    function getUserInfo(uint256 id) public returns (UserInfo memory){
        emit Return (AllUsers[id]);
        return AllUsers[id];
    }
}
