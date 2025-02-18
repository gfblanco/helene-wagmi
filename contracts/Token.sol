//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract Token {
    // ** EVENTS **
    // ERC-20 Events
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Hardhat Events
    event Proposal(address indexed _proposer, uint256 _amount);
    event Buy(address indexed _buyer, uint256 _amount, uint256 _etherAmount);
    event Reward(address indexed _validator, uint256 _amount);

    // Controller Events
    event ControllerTransfer(
        address _controller,
        address indexed _from,
        address indexed _to,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

    event ControllerRedemption(
        address _controller,
        address indexed _tokenHolder,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

    // Document Events
    event Document(bytes32 indexed _name, string _uri, bytes32 _documentHash);

    // Operator Events
    event AuthorizedOperator(address indexed _operator, address indexed _tokenHolder);
    event RevokedOperator(address indexed _operator, address indexed _tokenHolder);

    // Issuance / Redemption Events
    event Issued(address indexed _operator, address indexed _to, uint256 _value, bytes _data);
    event Redeemed(address indexed _operator, address indexed _from, uint256 _value, bytes _data);
    //event IssuedByPartition(bytes32 indexed _partition, address indexed _operator, address indexed _to, uint256 _value, bytes _data, bytes _operatorData);
    //event RedeemedByPartition(bytes32 indexed _partition, address indexed _operator, address indexed _from, uint256 _value, bytes _operatorData);

    // ** VARIABLES **

    // ERC-20 VARIABLES
    string public tokenName = "My Hardhat Token";
    string public tokenSymbol = "MHT";
    uint256 public tokenDecimals = 18;
    uint256 public totalSupply = 200000000000000000000;
    address public owner;

    mapping(address => mapping(address => uint256)) allowed;
    mapping(address => uint256) public balances;

    // MAIN CONTRACT VARIABLES
    mapping(address => bool) public minters; // controllers
    mapping(address => uint256) public votes;

    // ERC-1400 VARIABLES
    bool controllable = true;
    bool issuability = true;

    // Document variables
    struct Doc {
        string docUri;
        bytes32 docHash;
    }

    mapping(bytes32 => Doc) private documents;

    // ** MODIFIERS **
    modifier onlyMinter() {
        require(minters[msg.sender], "Only minters can call this function");
        _;
    }

    // ** CONSTRUCTOR **
    constructor() {
        // In order the test to work you must give some token to msg.sender
        balances[msg.sender] = totalSupply;
        /*
        balances[0x70997970C51812dc3A010C7d01b50e0d17dc79C8] = totalSupply / 2;
        balances[0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC] = totalSupply / 2;
 
        minters[0x70997970C51812dc3A010C7d01b50e0d17dc79C8] = true;
        minters[0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC] = true;
        */
        // As deployment is currently made by a patient account, hardcode the owner
        owner = msg.sender;

        // It could be interesting to add the owner as a minter,
        // but this could also be done with the updateMinter function
        minters[msg.sender] = true;
    }

    // ** FUNCTIONS **

    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    // ** ERC-20 FUNCTIONS **

    /**
     * @dev Approve the specified delegate to spend the specified amount of tokens on behalf of the sender.
     * @param delegate The address to be approved as a delegate.
     * @param numTokens The number of tokens to be approved.
     * @return A boolean value indicating whether the approval was successful or not.
     */
    function approve(address delegate, uint numTokens) public returns (bool) {
        require(delegate != msg.sender, "Delegate address must be different from the token owner");

        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);

        return true;
    }

    /**
     * @dev Returns the amount of tokens that the `_from` address allows the `delegate` address to spend on its behalf.
     * @param _from The address that owns the tokens.
     * @param delegate The address that is allowed to spend the tokens.
     * @return The amount of tokens that the `delegate` is allowed to spend on behalf of `_from`.
     */
    function allowance(address _from, address delegate) public view returns (uint) {
        return allowed[_from][delegate];
    }

    /**
     * @dev Returns the balance of the specified account.
     * @param account The address of the account to check.
     * @return The balance of the account.
     */
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(balances[from] >= amount, "Not enough tokens");

        // Token minting is a privileged operation
        require(from != address(0), "Cannot transfer from the zero address");

        // Token burning is a privileged operation
        require(to != address(0), "Cannot transfer to the zero address");

        // Avoid wasting gas on zero-value transfers
        require(amount > 0, "Amount must be greater than 0");

        balances[from] -= amount;
        balances[to] += amount;

        //emit Transfer(from, to, amount);
    }

    // ** PRIVILEGE AND PROPOSAL MANAGEMENT FUNCTIONS**

    /**
     * @dev Updates the minter status for a given address.
     * @param minter The address of the minter to update.
     * @param status The new status of the minter (true for active, false for inactive).
     * @notice Only the contract owner can update minters.
     */
    function updateMinter(address minter, bool status) external {
        require(msg.sender == owner, "Only owner can update minters");
        minters[minter] = status;
    }

    function submitProposal(uint256 amount) external {
        require(
            balances[msg.sender] > 0,
            "Token holder balance must be greater than 0 to submit a proposal"
        );

        votes[msg.sender] += amount;
        emit Proposal(msg.sender, amount);
    }

    function vote(address proposer) external {
        require(balances[msg.sender] > 0, "Token holder balance must be greater than 0 to vote");

        votes[proposer] += balances[msg.sender];
    }

    function rewardValidator(address validator) external {
        require(msg.sender == owner, "Only owner can reward validators");

        // uint256 rewardAmount = calculateReward(validator);

        //mint(validator, 0);

        emit Reward(validator, 0);
    }

    // ERC-1400 FUNCTIONS

    /**
     * @dev This internal function is used to validate transfer conditions before executing a transfer.
     * @param from The address of the sender.
     * @param to The address of the recipient.
     * @param amount The amount of tokens to be transferred.
     * @param data Additional data for the transfer.
     * @return status The status code indicating the result of the transfer conditions check.
     * @return message The message providing more details about the transfer conditions check result.
     */
    function _transferConditions(
        address from,
        address to,
        uint256 amount,
        bytes calldata data
    ) internal view returns (bytes1 status, bytes32 message) {
        if (data.length != 1) {
            return (0x50, "Invalid data length");
        } else if (keccak256(data) != keccak256(abi.encodePacked(bytes1(0x01)))) {
            return (0x50, "Invalid data");
        } else if (balances[from] < amount) {
            return (0x52, "Insufficient balance");
        } else if (from == address(0)) {
            return (0x56, "Invalid sender");
        } else if (to == address(0)) {
            return (0x57, "Invalid recipient");
        }

        return (0x51, "Transfer successful");
    }

    /**
     * @dev Checks if a transfer of tokens can be executed by the caller based on the transfer conditions.
     * @param to The address to which the tokens are being transferred.
     * @param amount The amount of tokens being transferred.
     * @param data Additional data required for the transfer conditions.
     * @return A tuple containing the result of the transfer conditions check.
     *         The first element is a single byte indicating the result.
     *         The second element is a 32-byte hash representing additional information about the transfer.
     */
    function canTransfer(
        address to,
        uint256 amount,
        bytes calldata data
    ) external view returns (bytes1, bytes32) {
        return _transferConditions(msg.sender, to, amount, data);
    }

    /**
     * @dev Checks if a transfer of tokens can be executed based on the transfer conditions.
     * @param from The address from which the tokens are being transferred.
     * @param to The address to which the tokens are being transferred.
     * @param amount The amount of tokens being transferred.
     * @param data Additional data required for the transfer conditions.
     * @return A tuple containing the result of the transfer conditions check.
     *         The first element is a single byte indicating the result.
     *         The second element is a 32-byte hash representing additional information about the transfer.
     */
    function canTransferFrom(
        address from,
        address to,
        uint256 amount,
        bytes calldata data
    ) external view returns (bytes1, bytes32) {
        return _transferConditions(from, to, amount, data);
    }

    /**
     * @dev Transfers tokens from the caller to a specified address with additional data.
     * @param to The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     * @param data Additional data to include in the transfer.
     * @notice This function performs a transfer of tokens and includes a transfer verification mechanism.
     * The transfer verification mechanism checks if the transfer is allowed based on the provided data.
     * If the transfer is not allowed, an error message is thrown.
     */
    function transferWithData(address to, uint256 amount, bytes calldata data) external {
        // Transfer verification mechanism
        (bytes1 resultCode, ) = _transferConditions(msg.sender, to, amount, data);
        require(resultCode == 0x51, "Illegal transfer");

        _transfer(msg.sender, to, amount);
    }

    /**
     * @dev Transfers tokens from one address to another with additional data.
     * @param from The address to transfer tokens from.
     * @param to The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     * @param data Additional data to include in the transfer.
     * @notice This function performs a transfer of tokens from the `from` address to the `to` address.
     * It also includes additional data that can be used for verification purposes.
     * @notice The transfer is subject to a verification mechanism, which checks if the transfer is allowed.
     * If the transfer is not allowed, an error with the message "Illegal transfer" is thrown.
     * @notice The function requires the caller to input an amount equal or lesser than the one authorised by the `from` address.
     */
    function transferFromWithData(
        address from,
        address to,
        uint256 amount,
        bytes calldata data
    ) external {
        // Transfer verification mechanism
        (bytes1 resultCode, ) = _transferConditions(from, to, amount, data);
        require(resultCode == 0x51, "Illegal transfer");

        allowed[from][msg.sender] -= amount;

        _transfer(from, to, amount);
    }

    /**
     * @dev Returns a boolean value indicating whether the token is issuable or not.
     * @return A boolean value indicating the issuability of the token.
     */
    function isIssuable() external view returns (bool) {
        return issuability;
    }

    // INTERNAL: ISSUE tokens
    function _issueTokens(address tokenHolder, uint256 amount, bytes calldata data) internal {
        totalSupply += amount;
        balances[tokenHolder] += amount;
        emit Issued(msg.sender, tokenHolder, amount, data);
    }

    /**
     * @dev Issues tokens to a specified token holder.
     * Only minters can call this function.
     * The data parameter must be 0x01 in this example.
     * Emits an `Issued` event.
     *
     * @param tokenHolder The address of the token holder.
     * @param amount The amount of tokens to be issued.
     * @param data Additional data associated with the token issuance.
     * @notice Only minters can issue tokens.
     * @notice Function visibility is non-negotiable as it is a requirement of ERC-1400.
     */
    function issue(address tokenHolder, uint256 amount, bytes calldata data) external onlyMinter {
        require(data.length == 1, "Data must be 1 byte");
        require(keccak256(data) == keccak256(abi.encodePacked(bytes1(0x01))), "Data must be 0x01");

        _issueTokens(tokenHolder, amount, data);
    }

    /**
     * @dev Retrieves the document details by its name.
     * @param name The name of the document.
     * @return docUri The URI of the document.
     * @return docHash The hash of the document.
     */
    function getDocument(bytes32 name) external view returns (string memory, bytes32) {
        return (documents[name].docUri, documents[name].docHash);
    }

    /**
     * @dev Sets the document details for a given name.
     * @param name The name of the document.
     * @param uri The URI of the document.
     * @param documentHash The hash of the document.
     */
    function setDocument(bytes32 name, string calldata uri, bytes32 documentHash) external {
        require(name != bytes32(0));

        documents[name] = Doc(uri, documentHash);
        emit Document(name, uri, documentHash);
    }

    // INTERNAL: Same problem that with issue function
    function _redeem(address from, uint256 amount, bytes calldata data) internal {
        require(data.length == 1, "Data must be 1 byte");
        require(keccak256(data) == keccak256(abi.encodePacked(bytes1(0x01))), "Data must be 0x01");

        require(balances[from] >= amount, "Not enough tokens to burn");
        balances[from] -= amount;
        totalSupply -= amount;
    }

    /**
     * @dev Allows minters to redeem their tokens.
     * @param amount The amount of tokens to redeem.
     * @param data Additional data for the redemption process.
     * @notice Only minters can redeem tokens.
     * @notice The data must be 1 byte and equal to 0x01.
     * @notice Emits a Redeemed event.
     */
    function redeem(uint256 amount, bytes calldata data) external onlyMinter {
        _redeem(msg.sender, amount, data);
        emit Redeemed(msg.sender, msg.sender, amount, data);
    }

    /**
     * @dev Allows a minter to redeem tokens from a specified address.
     * @param from The address from which tokens will be redeemed.
     * @param amount The amount of tokens to be redeemed.
     * @param data Additional data associated with the redemption.
     * @notice Only minters can redeem tokens.
     * @notice The data must be 1 byte and equal to 0x01.
     * @notice Emits a `Redeemed` event.
     * @notice In this context, the function is the same as the `controllerRedeem` function.
     */
    function redeemFrom(address from, uint256 amount, bytes calldata data) external onlyMinter {
        _redeem(from, amount, data);
        emit Redeemed(msg.sender, from, amount, data);
    }

    /**
     * @dev Returns a boolean value indicating whether the token is controllable.
     * @return A boolean value indicating whether the token is controllable.
     */
    function isControllable() external view returns (bool) {
        return controllable;
    }

    /**
     * @dev Transfers tokens from one address to another using the controller/minter's authority.
     * Only minters can call this function.
     *
     * @param from The address to transfer tokens from.
     * @param to The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     * @param data Additional data to be passed along with the transfer.
     */
    function controllerTransfer(
        address from,
        address to,
        uint256 amount,
        bytes calldata data
    ) external onlyMinter {
        _transfer(from, to, amount);
        emit ControllerTransfer(msg.sender, from, to, amount, data, data);
    }

    /**
     * @dev Allows the controller/minter to redeem tokens from the `tokenHolder` address.
     * @param tokenHolder The address of the token holder.
     * @param amount The amount of tokens to be redeemed.
     * @param data Additional data associated with the redemption.
     * @notice Only minters can call this function.
     * @notice The data must be 1 byte and equal to 0x01.
     * @notice Emits a `ControllerRedemption` event.
     * @notice In this context, the function is the same as the `redeemFrom` function.
     */
    function controllerRedeem(
        address tokenHolder,
        uint256 amount,
        bytes calldata data
    ) external onlyMinter {
        require(data.length == 1, "Data must be 1 byte");
        require(keccak256(data) == keccak256(abi.encodePacked(bytes1(0x01))), "Data must be 0x01");

        require(balances[tokenHolder] >= amount, "Not enough tokens to burn");
        balances[tokenHolder] -= amount;
        totalSupply -= amount;

        emit ControllerRedemption(msg.sender, tokenHolder, amount, data, data);
    }

    function buy() external payable {
        uint256 tokensAmount = msg.value;
        require(tokensAmount > 0, "Ether amount must be greater than 0");

        // Transfer verification mechanism
        //(bytes1 resultCode,) = _transferConditions(address(owner), msg.sender, tokensAmount, data);
        //require(resultCode == 0x51, "Illegal transfer");

        _transfer(address(owner), msg.sender, tokensAmount);

        emit Buy(msg.sender, tokensAmount, msg.value);
    }

    // Batch operations

    /**
     * @dev Transfers multiple amounts of tokens to multiple recipients with additional data.
     * @param recipients An array of recipient addresses.
     * @param amounts An array of token amounts to transfer.
     * @param data An array of additional data to include in the transfer.
     * @notice The `transferWithData` restrictions apply to this function.
     * Requirements:
     * - The `recipients` and `amounts` arrays must have the same length.
     * - The `amounts` and `data` arrays must have the same length.
     */
    function batchTransferWithData(
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes[] calldata data
    ) external {
        require(
            recipients.length == amounts.length,
            "Recipients and amounts arrays must have the same length"
        );
        require(amounts.length == data.length, "Amounts and data arrays must have the same length");

        for (uint256 i = 0; i < recipients.length; i++) {
            (bytes1 resultCode, ) = _transferConditions(
                msg.sender,
                recipients[i],
                amounts[i],
                data[i]
            );
            require(resultCode == 0x51, "Illegal transfer");

            _transfer(msg.sender, recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Issues multiple tokens to multiple recipients with corresponding amounts and data.
     * @param recipients An array of recipient addresses.
     * @param amounts An array of token amounts to be issued to each recipient.
     * @param data An array of additional data associated with each token issuance.
     * @notice The `issue` restrictions apply to this function.
     * Requirements:
     * - The `recipients` and `amounts` arrays must have the same length.
     * - The `amounts` and `data` arrays must have the same length.
     */
    function batchIssue(
        address[] calldata recipients,
        uint256[] calldata amounts,
        bytes[] calldata data
    ) external onlyMinter {
        require(
            recipients.length == amounts.length,
            "Recipients and amounts arrays must have the same length"
        );
        require(amounts.length == data.length, "Amounts and data arrays must have the same length");

        for (uint256 i = 0; i < recipients.length; i++) {
            // Using `this.issue()` will cause an error because the msg.sender is different

            require(data[i].length == 1, "Data must be 1 byte");
            require(
                keccak256(data[i]) == keccak256(abi.encodePacked(bytes1(0x01))),
                "Data must be 0x01"
            );

            _issueTokens(recipients[i], amounts[i], data[i]);
        }
    }

    /**
     * @dev Redeems multiple tokens from multiple addresses in a batch.
     * @param redeemed The array of addresses from which tokens will be redeemed.
     * @param amounts The array of token amounts to be redeemed.
     * @param data The array of additional data to be passed to the redeemFrom function.
     * Requirements:
     * - The `redeemed` and `amounts` arrays must have the same length.
     * - The `amounts` and `data` arrays must have the same length.
     */
    function batchRedeemFrom(
        address[] calldata redeemed,
        uint256[] calldata amounts,
        bytes[] calldata data
    ) external onlyMinter {
        require(
            redeemed.length == amounts.length,
            "Redeemed and amounts arrays must have the same length"
        );
        require(amounts.length == data.length, "Amounts and data arrays must have the same length");

        for (uint256 i = 0; i < redeemed.length; i++) {
            require(data[i].length == 1, "Data must be 1 byte");
            require(
                keccak256(data[i]) == keccak256(abi.encodePacked(bytes1(0x01))),
                "Data must be 0x01"
            );

            _redeem(redeemed[i], amounts[i], data[i]);
        }
    }

    // ** ERC-1400 REQUIRED FUNCTIONS **

    /*
    function balanceOfByPartition(bytes32 partition, address tokenHolder) external view returns (uint256) {
        return this.balanceOf(tokenHolder);
    }

    function partitionsOf(address tokenHolder) external view returns (bytes32[] memory) {
        bytes32[] memory partitions;

        return partitions;
    }

    function transferByPartition(bytes32 partition, address to, uint256 value, bytes calldata data) external returns (bytes32) {
        return bytes32(uint256(0));
    }

    function operatorTransferByPartition(bytes32 partition, address from, address to, uint256 value, bytes calldata _data, bytes calldata _operatorData) external returns (bytes32) {
        return bytes32(uint256(0));
    }

    function authorizeOperator(address operator) external {
        // Empty function
    }

    function revokeOperator(address operator) external {
        // Empty function
    }

    function authorizeOperatorByPartition(bytes32 partition, address operator) external {
        // Empty function
    }

    function revokeOperatorByPartition(bytes32 partition, address operator) external {
        // Empty function
    }

    function isOperator(address operator, address tokenHolder) external view returns (bool) {
        return false;
    }

    function isOperatorForPartition(bytes32 partition, address operator, address tokenHolder) external view returns (bool) {
        return false;
    }

    function issueByPartition(bytes32 partition, address tokenHolder, uint256 value, bytes calldata _data) external {
        // Empty function
    }

    function redeemByPartition(bytes32 partition, uint256 value, bytes calldata data) external {
        // Empty function
    }

    function operatorRedeemByPartition(bytes32 partition, address tokenHolder, uint256 value, bytes calldata operatorData) external {
        // Empty function
    }

    function canTransferByPartition(address from, address to, bytes32 partition, uint256 value, bytes calldata data) external view returns (bytes1, bytes32, bytes32) {
        return (0x50, "Transfer failure", bytes32(uint256(0)));
    }
    */
}
