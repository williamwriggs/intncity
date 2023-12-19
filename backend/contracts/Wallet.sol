// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Wallet is Ownable, IERC721Receiver {
    bytes32 public recipientId;

    constructor(bytes32 recipientId_) {
        recipientId = recipientId_;
    }

    function executeTransaction(address _to, bytes memory _data) public onlyOwner {
        (bool success, ) = _to.call(_data);
        require(success, "call failed");
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
