// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IERC721AutoIdURIStorageMintable {
    /**
     * @dev Mint a new token with the specified owner, tokenURI
     *
     * The token will be created with the specified URI concatenated with
     * the baseURI, so the complete URI will be
     *   <baseURI()>/<tokenURI>
     *
     * _data is passed to the account receiving the token if that account is a contract.
     */
    function mintWithAutoIdAndTokenURI(
        address to,
        string memory tokenURI,
        bytes calldata _data
    ) external returns (uint256);
}
