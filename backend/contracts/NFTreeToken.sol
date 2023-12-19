// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC721AutoIdURIStorageMintable.sol";

contract NFTreeToken is ERC721URIStorage, Ownable, IERC721AutoIdURIStorageMintable {
    uint256 public nextId;
    uint256 private _totalSupply;
    string private _contractURI;

    constructor(string memory name_, string memory symbol_, string memory contractURI_) ERC721(name_, symbol_) {
        nextId = 0;
        _totalSupply = 0;
        _contractURI = contractURI_;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "ipfs://";
    }

    function baseURI() external view returns (string memory) {
        return _baseURI();
    }

    // Metadata for opensea
    // https://docs.opensea.io/docs/contract-level-metadata
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function setContractURI(string memory contractURI_) external onlyOwner {
        _contractURI = contractURI_;
    }

    function safeMintAutoId(address to, bytes calldata _data) external onlyOwner returns (uint256) {
        return _safeMintAutoId(to, _data);
    }

    function _safeMintAutoId(address to, bytes calldata _data) internal returns (uint256) {
        uint256 thisTokenId = nextId;
        _safeMint(to, thisTokenId, _data);
        nextId += 1;
        return thisTokenId;
    }

    function burn(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
        _totalSupply -= 1;
    }

    function mintWithAutoIdAndTokenURI(
        address to,
        string memory tokenURI,
        bytes calldata _data
    ) external override onlyOwner returns (uint256) {
        uint256 thisTokenId = _safeMintAutoId(to, _data);
        _setTokenURI(thisTokenId, tokenURI);
        return thisTokenId;
    }

    function _mint(address to, uint256 tokenId) internal virtual override {
        super._mint(to, tokenId);
        _totalSupply += 1;
    }
}
