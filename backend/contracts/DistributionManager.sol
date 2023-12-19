// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC721AutoIdURIStorageMintable.sol";
import "./Wallet.sol";

contract DistributionManager is Ownable {
    event Distribution(
        bytes32 indexed _distributionId,
        bytes32 indexed _recipientId,
        address _recipient,
        address erc20Token,
        uint256 erc20Amount,
        address erc721Token,
        uint256 erc721TokenId
    );

    event CreateWallet(bytes32 indexed _recipientId, address _recipient);

    struct DistributionInfo {
        address recipient;
        bytes32 recipientId;
        uint256 erc721TokenId;
    }

    // Mapping from off-chain IDs to on chain information.
    mapping(bytes32 => DistributionInfo) public distributionIdToInfo;
    mapping(bytes32 => address) public recipientIdToAddress;

    function getDistributionInfo(bytes32 distributionId)
        external
        view
        returns (DistributionInfo memory)
    {
        DistributionInfo memory info = distributionIdToInfo[distributionId];
        require(info.recipient != address(0), "no distribution with that ID");
        return info;
    }

    function getRecipientAddress(bytes32 recipientId) external view returns (address) {
        address recipient = recipientIdToAddress[recipientId];
        require(recipient != address(0), "no address for that recipientId");
        return recipient;
    }

    function distributeERC20AndERC721(
        address recipient,
        bytes32 recipientId,
        bytes32 distributionId,
        IERC20 erc20Address,
        uint256 erc20Amount,
        IERC721AutoIdURIStorageMintable erc721Address,
        string memory tokenURI
    ) external onlyOwner {
        _distributeERC20AndERC721(
            recipient,
            recipientId,
            distributionId,
            erc20Address,
            erc20Amount,
            erc721Address,
            tokenURI
        );
    }

    function _distributeERC20AndERC721(
        address recipient,
        bytes32 recipientId,
        bytes32 distributionId,
        IERC20 erc20Token,
        uint256 erc20Amount,
        IERC721AutoIdURIStorageMintable erc721Token,
        string memory tokenURI
    ) private onlyOwner {
        require(recipientId != bytes32(0), "must specify recipientId");
        require(distributionId != bytes32(0), "must specify distributionId");
        require(recipient != address(0), "distribute to address 0");

        // Check that we haven't already done this distribution.
        require(
            distributionIdToInfo[distributionId].recipient == address(0),
            "already distributed"
        );

        // Distribute the ERC20 token.
        erc20Token.transferFrom(msg.sender, recipient, erc20Amount);

        // Distribute the ERC721 token
        uint256 erc721TokenId = erc721Token.mintWithAutoIdAndTokenURI(recipient, tokenURI, "");

        // Mark that we sent this distribution.
        distributionIdToInfo[distributionId] = DistributionInfo({
            recipient: recipient,
            recipientId: recipientId,
            erc721TokenId: erc721TokenId
        });

        emit Distribution(
            distributionId,
            recipientId,
            recipient,
            address(erc20Token),
            erc20Amount,
            address(erc721Token),
            erc721TokenId
        );
    }

    // Uses the on-chain wallet we have stored for the off-chain recipientId,
    // otherwise deploys a new wallet and stores it for future distributions.
    function distributeERC20AndERC721ToOffChainId(
        bytes32 recipientId,
        bytes32 distributionId,
        IERC20 erc20Address,
        uint256 erc20Amount,
        IERC721AutoIdURIStorageMintable erc721Address,
        string memory tokenURI
    ) external onlyOwner {
        address recipient = recipientIdToAddress[recipientId];
        if (recipient == address(0)) {
            Wallet recipientWallet = new Wallet(recipientId);
            recipientWallet.transferOwnership(msg.sender);
            recipient = address(recipientWallet);
            recipientIdToAddress[recipientId] = recipient;
            emit CreateWallet(recipientId, recipient);
        }

        _distributeERC20AndERC721(
            recipient,
            recipientId,
            distributionId,
            erc20Address,
            erc20Amount,
            erc721Address,
            tokenURI
        );
    }

    function executeTransaction(address _to, bytes memory _data) public onlyOwner {
        (bool success, ) = _to.call(_data);
        require(success, "call failed");
    }
}
