pragma solidity 0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ThirdToken is Ownable, ERC20("Third Token Test", "TTT") {
    function mint(address _to, uint256 _amount) public onlyOwner{
        _mint(_to, _amount);
    }
}