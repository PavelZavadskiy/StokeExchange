pragma solidity 0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SecondToken is Ownable, ERC20("Second Token Test", "STT") {
    function mint(address _to, uint256 _amount) public onlyOwner{
        _mint(_to, _amount);
    }
}