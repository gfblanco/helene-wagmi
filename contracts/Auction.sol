// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.28;

contract Auction {
    enum TestType {
        PCR,
        Antigen,
        Antibody,
        Null
    }
    enum TestAccuracy {
        High,
        Medium,
        Low,
        Null
    }
    enum TestDeliveryTime {
        Instant,
        Fast,
        Average,
        Low,
        Null
    }

    /*
        The user's test feature preference is not
        included as it is only necessary for
        the frontend in order to put restrictions
        for the auction bids.
    */
    struct UserRequest {
        address userAddress;
        address labAddress;
        uint testPrice;
        uint startDate;
        uint timeLimit;
        bool done;
        TestType testType;
        TestAccuracy testAccuracy;
        TestDeliveryTime testDeliveryTime;
    }

    UserRequest public request;

    /*
        The request variable allows anyone to
        check the details of the patient's
        request, giving transparency.
    */
    event Start(UserRequest userRequest);
    function start(uint8 _userTestType) external {
        //request.idTest = _userTestType;
        request.userAddress = msg.sender;
        request.startDate = block.timestamp;
        request.timeLimit = block.timestamp + 6 minutes;
        request.testType = TestType(_userTestType);
        request.done = false;

        request.labAddress = address(0);
        request.testAccuracy = TestAccuracy.Null;
        request.testDeliveryTime = TestDeliveryTime.Null;
        request.testPrice = 10000;

        emit Start(request);
    }

    event End(UserRequest userRequest);
    function end(
        address _labAddress,
        uint8 _testAccuracy,
        uint8 _testDeliveryTime,
        uint _testPrice
    ) external payable {
        request.labAddress = _labAddress;
        request.testAccuracy = TestAccuracy(_testAccuracy);
        request.testDeliveryTime = TestDeliveryTime(_testDeliveryTime);
        request.testPrice = _testPrice;
        request.done = true;

        emit End(request);
    }

    /* Se conserva por si se necesita conectar al contrato Token
    address public tokenAddress = address(0);
    
    function getTokenAddress() public view returns(address) {
        return tokenAddress;
    }
    
    function setTokenAddress(address _tokenAddress) public {
        tokenAddress = _tokenAddress;
    }
    */
}
