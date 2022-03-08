// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWakulima.sol";

contract WakulimaToken is ERC20, Ownable {
    uint256 public constant tokenPrice = 0.001 ether;

    uint256 public constant tokensPerNFT = 10 * 10**18;

    // The max total supply is 10000 for Wakulima Tokens
    uint256 public constant maxTotalSupply = 10000 * 10**18;

    // WakulimaNFT contract instance
    IWakulima WakulimaNFT;

    // Mapping to keep track of which tokenIds have been claimed
    mapping(uint256 => bool) public tokenIdsClaimed;

    constructor(address _wakulimaContract) ERC20("Wakulima Token", "WKT") {
        WakulimaNFT = IWakulima(_wakulimaContract);
    }

    /**
     * @dev Mints amount number of WakulimaTokens
     * Requirements: `msg.value` should be equal to or greater than the tokenPrice * amount
     */
    function mint(uint256 amount) public payable {
        uint256 _requiredAmount = tokenPrice * amount;
        require(msg.value >= _requiredAmount, "Ether sent is incorrect");

        // Totoal tokens + amount <= 10000, otherwise, revert the transaction
        uint256 amountWithDecimals = amount * 10**18;
        require(
            (totalSupply() + amountWithDecimals) <= maxTotalSupply,
            "Exceeds the max total supply available"
        );

        // Call the interanal function from Openzeppelin's ERC20 contract
        _mint(msg.sender, amountWithDecimals);
    }

    /**
    * @dev Mint NFTs based one the number of NFT's held by sender
    * Requirements: balance of wakulima NFTs owned by the sender should be greater than 0
                    Tokens shouldn't have been claimed for all the NFTs owned by the sender
    */
    function claim() public {
        address sender = msg.sender;

        uint256 balance = WakulimaNFT.balanceOf(sender);

        //If balance is 0, revert transaction
        require(balance > 0, "You don't own any Wakulima NFT");

        // Amount keeps track of number of unclaimed tokens
        uint256 amount = 0;

        // Loop over the balance and get the token ID owned by `sender` at a given `index` of its token list
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = WakulimaNFT.tokenOfOwnerByIndex(sender, i);

            // If the tokenId has not been claimed, increase the Amount
            if (!tokenIdsClaimed[tokenId]) {
                amount += 1;
                tokenIdsClaimed[tokenId] = true;
            }
        }

        // if all the token Ids have been claimed, revert the transaction
        require(amount > 0, "You have already claimed all the tokens");

        // Mint (amount * 10) tokens for each NFT
        _mint(msg.sender, amount * tokensPerNFT);
    }

    // Function to recieve Ether.msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
