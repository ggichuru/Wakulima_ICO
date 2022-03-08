// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IWakulima {
    /** @dev Returns a token ID owned by `owner` at a given `index` of its token list
     *   Use along wiht {balanceOf} to enumerate all of the `owner's` tokens
     */
    function tokenOfOwnerByIndex(address owner, uint256 index)
        external
        view
        returns (uint256 tokenId);

    // Return balance of tokens in owners account
    function balanceOf(address owner) external view returns (uint256 balance);
}
