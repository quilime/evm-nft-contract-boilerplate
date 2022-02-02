// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is Context, ERC721, Ownable, IERC2981, ERC165Storage {
    using Counters for Counters.Counter;
    event Mint(address to, uint256 indexed tokenId);

    // supply and price
    uint256 public maxSupply = 10;
    uint256 public maxDevMints = 3;
    uint256 public price = 0.009 * 10**18;

    // minting open/closed
    bool private _mintOpen = true;

    // token counters
    Counters.Counter private _tokenIds;
    Counters.Counter private _devMints;

    // base token uri
    string private _baseTokenURI;
    string private _contractURI;

    // secondary market royalties
    // (set in constructor)
    address public royaltiesAddress;
    uint256 public royaltiesPercentage;

    // Bytes4 Code for ERC interfaces
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a; // https://eips.ethereum.org/EIPS/eip-2981
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd; // https://eips.ethereum.org/EIPS/eip-721

    /**
     * @dev MyToken Constructor
     * @param name_ - Token Name
     * @param symbol_ - Token Symbol
     * @param baseTokenURI_ - Base token metadata URI
     * @param contractURI_ - Contract metadata URI
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseTokenURI_,
        string memory contractURI_
    ) ERC721(name_, symbol_) {
        _baseTokenURI = baseTokenURI_;
        _contractURI = contractURI_;

        royaltiesAddress = owner();
        royaltiesPercentage = 10;

        // register the supported ERC interfaces
        _registerInterface(_INTERFACE_ID_ERC721);
        _registerInterface(_INTERFACE_ID_ERC2981);
    }

    /**
     * @dev get contractURI
     * @return the contractURI string
     */
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    /**
     * @dev (OnlyOwner) Mint a reserved mint token
     * @param to_ - the receiving address
     */
    function devMint(address to_) public onlyOwner {
        _devMints.increment();
        require(_devMints.current() <= maxDevMints, "Dev Mint Supply Depleted");
        require(_tokenIds.current() < maxSupply + maxDevMints, "Supply Depleted");
        _mint(to_);
    }

    /**
     * @dev Mint a token
     */
    function mint() public payable {
        require(_mintOpen, "Minting is closed");
        require(msg.value >= price, "Must pay for minting");
        require(_tokenIds.current() < maxSupply - maxDevMints, "Supply Depleted");
        (bool success, ) = owner().call{value: msg.value}("");
        require(success, "Transfer Failed");
        _mint(_msgSender());
    }

    /**
     * @dev Called with the sale price to determine how much royalty is owed and to whom.
     * @param tokenId_ - the NFT asset queried for royalty information
     * @param salePrice_ - the sale price of the NFT asset specified by `tokenId`
     * @return receiver - address of who should be sent the royalty payment
     * @return donationAmount - the royalty payment amount for `salePrice`
     */
    function royaltyInfo(uint256 tokenId_, uint256 salePrice_)
        external
        view
        override(IERC2981)
        returns (address receiver, uint256 donationAmount)
    {
        require(_exists(tokenId_), "ERC721: Nonexistent Token ID");
        receiver = royaltiesAddress;
        donationAmount = (salePrice_ * royaltiesPercentage) / 100;
    }

    /**
     * @dev set public minting open or closed
     * @param isOpen_  - boolean open or closed
     */
    function setMintOpen(bool isOpen_) public onlyOwner {
        _mintOpen = isOpen_;
    }

    /**
     * @dev get mint open or closed
     */
    function getMintOpen() public view returns (bool) {
        return _mintOpen;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, IERC165, ERC165Storage)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev set baseTokenURI
     */
    function setBaseTokenURI(string memory baseTokenURI_) public onlyOwner {
        _baseTokenURI = baseTokenURI_;
    }

    /**
     * @dev set contractURI
     */
    function setContractURI(string memory contractURI_) public onlyOwner {
        _contractURI = contractURI_;
    }

    /**
     * @dev set royalties address
     */
    function setRoyaltiesAddress(address address_) public onlyOwner {
        royaltiesAddress = address_;
    }

    /**
     * @dev set royalty percentage amount
     */
    function setRoyaltiesPercentage(uint256 percentage_) public onlyOwner {
        royaltiesPercentage = percentage_;
    }

    /**
     * @dev Get total token supply
     * @return _tokenID.current() - the current position of the _tokenIDs counter
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @dev get tokenURI
     * @param tokenId - the tokenid
     * @return the tokenURI string
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory baseTokenURI = _baseURI();
        string memory id = Strings.toString(tokenId);
        return bytes(baseTokenURI).length > 0 ? string(abi.encodePacked(baseTokenURI, id, ".json")) : "";
    }

    /**
     * @dev Get baseTokenURI
     * @return _baseTokenURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Mint token, emits a Mint event
     * @param to_ - the receiving address
     */
    function _mint(address to_) private {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        _safeMint(to_, tokenId);
        emit Mint(to_, tokenId);
    }
}
