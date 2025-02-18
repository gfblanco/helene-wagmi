// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract Oracle {
    event eventRandomNumber(address indexed _sender);

    function triggerRandomNumber() external {
        // Emitir el evento
        emit eventRandomNumber(msg.sender);
    }

    uint256 public randomValue; // Variable para almacenar un valor
    address public storedSender; // Variable para almacenar una dirección

    // Función para establecer un valor
    function setRandomValue(address sender, uint256 newValue) public {
        randomValue = newValue;
        storedSender = sender;
    }

    // Función para obtener el valor almacenado
    function getRandomValue() public view returns (address, uint256) {
        return (storedSender, randomValue);
    }

    // Eventos para llamar a la función con longitudes de bytes aleatorios variables

    event eventRandomNumberLength(address indexed _sender, uint256 _length);

    function triggerRandomNumberLength(uint256 _lentgh) external {
        // Emitir el evento
        emit eventRandomNumberLength(msg.sender, _lentgh);
    }

    uint public randomValueLength; // Variable para almacenar un valor
    address public secondSender; // Variable para almacenar una dirección

    // Función para establecer un valor
    function setRandomValueLength(address sender, uint256 newValue) public {
        randomValueLength = newValue;
        secondSender = sender;
    }

    // Función para obtener el valor almacenado
    function getRandomValueLength() public view returns (address, uint256) {
        return (secondSender, randomValueLength);
    }

    // IPFS //

    event IPFS_Add_Event(address indexed _sender, string contractAddress, string cipher);
    function trigger_IPFS_Add_Event(
        string memory _contractAddress,
        string memory _cipher
    ) external {
        // Emitir el evento
        emit IPFS_Add_Event(msg.sender, _contractAddress, _cipher);
    }

    event IPFS_Cat_Event(address indexed _sender, string contractAddress);
    event pop_Mapping_Value(string cipher);
    function trigger_IPFS_Cat_Event(string memory _contractAddress) external {
        emit IPFS_Cat_Event(msg.sender, _contractAddress);
        string memory cipher = getValuesIPFS(_contractAddress);
        emit pop_Mapping_Value(cipher);
    }

    mapping(string => string) private auctionToCipher;
    function setValuesIPFS(string memory _contractAddress, string memory _cipher) public {
        auctionToCipher[_contractAddress] = _cipher;
    }

    function getValuesIPFS(string memory _contractAddress) public view returns (string memory) {
        return auctionToCipher[_contractAddress];
    }
}
