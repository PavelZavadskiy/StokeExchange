pragma solidity 0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";

interface I_Token{
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function symbol() external view returns (string memory);
    function name() external view returns (string memory);
}

interface I_Agregator{
    function decimals() external view returns (uint8);
    function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

contract StokeExchange is Ownable{
    struct StockExchangeElement{
        address agregator;
        address payable purse;
        address admin;
    }

    struct TokenInfo {
        address token;
        string symbol;
        string name;
    }

    address[] private tokensList;
    mapping(address => StockExchangeElement) private stockExchangeElements;

    event AddToken(address indexed _token, address _agregator, address _purse, address admin);
    event RemoveToken(address indexed _token, address admin);
    event BuyToken(address indexed _token, address indexed _buyer, uint256 _ethAmount, uint256 _tokenAmount);

    function getTokensListLength() external view returns(uint256){
        return tokensList.length;
    }

    function getTokenInfo(uint256 _idx) external view returns(address token, string memory symbol, string memory name){
        require(_idx<tokensList.length, "Wrong index!");
        address _token = tokensList[_idx];
        token = _token;
        symbol = I_Token(token).symbol();
        name = I_Token(token).name();
    }

    function getTokenPrice(address _token) public view returns(uint256 price, uint256 decimals){
        require(_token != address(0), "Token address is zero!");
        StockExchangeElement storage _element = stockExchangeElements[_token];
        require(_element.agregator != address(0), "Token not found!");
        ( , int256 _price, , , ) = I_Agregator(_element.agregator).latestRoundData();
        price = uint256(_price);
        decimals = uint256(I_Agregator(_element.agregator).decimals());  
    }

    function expectedTokensNumber(address _token, uint256 _ethAmount) external view returns (uint256) {
        (uint256 _price, uint256 _decimals) = getTokenPrice(_token);
        return (_ethAmount * _price) / (10**_decimals);
    }

    function tokenBalance(address _token) external view returns (uint256) {
        return I_Token(_token).balanceOf(address(this));
    }

    function addToken(address _token, address _agregator, address payable _purse, address _admin) public {
        require(_token != address(0), "Token address is zero!");
        require(_agregator != address(0), "Agregator address is zero!");
        require(_purse != address(0), "Purse address is zero!");
        require(_admin != address(0), "Admin address is zero!");
        string memory _symbol = I_Token(_token).symbol();
        require(bytes(_symbol).length>0, "No token symbol!");
        require(stockExchangeElements[_token].agregator == address(0), "This token is present!");

        stockExchangeElements[_token] = StockExchangeElement(_agregator, _purse, _admin);
        tokensList.push(_token);

        emit AddToken(_token, _agregator, _purse, _admin);
    }

    function _remove(address _token) private{ 
        require(_token != address(0), "Token address is zero!");
        delete stockExchangeElements[_token];
        uint _length = tokensList.length;
        for(uint256 i = 0; i < _length; i++) {
            if(tokensList[i] == _token) {
                tokensList[i] = tokensList[_length-1];
                tokensList.pop();
                return;
            }
        }
    }

    function removeToken(address _token) public {
        require(_token != address(0), "Token address is zero!");
        StockExchangeElement storage _element = stockExchangeElements[_token];
        require(_element.agregator != address(0), "Token not found!");
        require(msg.sender==_element.admin, "You are not admin of this element!");
        address _admin = _element.admin;
        _remove(_token);
        I_Token(_token).transfer(_admin, I_Token(_token).balanceOf(address(this)));
        emit RemoveToken(_token, msg.sender);
    }

    function buyTokens(address _token) public payable{
        require(_token != address(0), "Token address is zero!");
        StockExchangeElement storage _element = stockExchangeElements[_token];
        require(_element.agregator!=address(0), "Token not found!");
        (uint256 _price, uint256 _decimals) = getTokenPrice(_token);
        uint256 _numberTokens = (msg.value * _price) / (10**_decimals);
        if(_numberTokens == 0)
        {
            (bool sent, bytes memory data) = msg.sender.call{value: msg.value}("Sorry, calculated 0 tokens!");
            return;
        }
        if( I_Token(_token).balanceOf(address(this)) < _numberTokens )
        {
            (bool sent, bytes memory data) = msg.sender.call{value: msg.value}("Sorry, there is not enough tokens to buy!");
            return;
        }
        _element.purse.transfer(msg.value);
        I_Token(_token).transfer(msg.sender, _numberTokens);
        emit BuyToken(_token, msg.sender, msg.value, _numberTokens);
    }
}