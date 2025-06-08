
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DeliveryPlatform is ReentrancyGuard, Ownable {
    struct Order {
        uint256 orderId;
        address customer;
        address agent;
        string restaurant;
        string dish;
        uint256 quantity;
        uint256 amount;
        string pickupLocation;
        string dropLocation;
        OrderStatus status;
        uint256 createdAt;
        uint256 confirmedAt;
        uint256 completedAt;
    }

    struct Agent {
        address agentAddress;
        string name;
        uint256 rating;
        uint256 totalDeliveries;
        bool isActive;
    }

    enum OrderStatus {
        Posted,
        Confirmed,
        InProgress,
        Delivered,
        Completed,
        Cancelled
    }

    mapping(uint256 => Order) public orders;
    mapping(address => Agent) public agents;
    mapping(address => uint256[]) public customerOrders;
    mapping(address => uint256[]) public agentOrders;
    
    uint256 public nextOrderId = 1;
    uint256 public platformFeePercent = 5; // 5% platform fee
    
    IERC20 public token; // For token payments
    
    event OrderPosted(uint256 indexed orderId, address indexed customer, uint256 amount);
    event OrderConfirmed(uint256 indexed orderId, address indexed agent);
    event OrderCompleted(uint256 indexed orderId, address indexed customer, address indexed agent, uint256 amount);
    event PaymentMade(uint256 indexed orderId, address indexed customer, address indexed agent, uint256 amount, bool isETH);
    event AgentRegistered(address indexed agent, string name);

    constructor(address _token) {
        token = IERC20(_token);
    }

    function registerAgent(string memory _name) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        agents[msg.sender] = Agent({
            agentAddress: msg.sender,
            name: _name,
            rating: 50, // Start with 5.0 rating (50/10)
            totalDeliveries: 0,
            isActive: true
        });
        
        emit AgentRegistered(msg.sender, _name);
    }

    function postOrder(
        string memory _restaurant,
        string memory _dish,
        uint256 _quantity,
        string memory _pickupLocation,
        string memory _dropLocation
    ) external payable {
        require(msg.value > 0, "Payment required");
        require(bytes(_restaurant).length > 0, "Restaurant name required");
        
        uint256 orderId = nextOrderId++;
        
        orders[orderId] = Order({
            orderId: orderId,
            customer: msg.sender,
            agent: address(0),
            restaurant: _restaurant,
            dish: _dish,
            quantity: _quantity,
            amount: msg.value,
            pickupLocation: _pickupLocation,
            dropLocation: _dropLocation,
            status: OrderStatus.Posted,
            createdAt: block.timestamp,
            confirmedAt: 0,
            completedAt: 0
        });
        
        customerOrders[msg.sender].push(orderId);
        
        emit OrderPosted(orderId, msg.sender, msg.value);
    }

    function confirmOrder(uint256 _orderId) external {
        require(agents[msg.sender].isActive, "Agent not registered");
        require(orders[_orderId].status == OrderStatus.Posted, "Order not available");
        require(orders[_orderId].agent == address(0), "Order already confirmed");
        
        orders[_orderId].agent = msg.sender;
        orders[_orderId].status = OrderStatus.Confirmed;
        orders[_orderId].confirmedAt = block.timestamp;
        
        agentOrders[msg.sender].push(_orderId);
        
        emit OrderConfirmed(_orderId, msg.sender);
    }

    function completeDelivery(uint256 _orderId) external {
        require(orders[_orderId].agent == msg.sender, "Not your order");
        require(orders[_orderId].status == OrderStatus.Confirmed, "Order not confirmed");
        
        orders[_orderId].status = OrderStatus.Delivered;
        orders[_orderId].completedAt = block.timestamp;
    }

    function payAgent(uint256 _orderId) external payable nonReentrant {
        Order storage order = orders[_orderId];
        require(order.customer == msg.sender, "Not your order");
        require(order.status == OrderStatus.Delivered, "Order not delivered");
        require(msg.value == order.amount, "Incorrect payment amount");
        
        uint256 platformFee = (order.amount * platformFeePercent) / 100;
        uint256 agentPayment = order.amount - platformFee;
        
        // Transfer payment to agent
        payable(order.agent).transfer(agentPayment);
        
        // Platform fee stays in contract
        
        order.status = OrderStatus.Completed;
        
        // Update agent stats
        agents[order.agent].totalDeliveries++;
        
        emit PaymentMade(_orderId, msg.sender, order.agent, agentPayment, true);
        emit OrderCompleted(_orderId, msg.sender, order.agent, agentPayment);
    }

    function payAgentWithToken(uint256 _orderId, uint256 _amount) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.customer == msg.sender, "Not your order");
        require(order.status == OrderStatus.Delivered, "Order not delivered");
        
        uint256 platformFee = (_amount * platformFeePercent) / 100;
        uint256 agentPayment = _amount - platformFee;
        
        // Transfer tokens from customer to agent
        require(token.transferFrom(msg.sender, order.agent, agentPayment), "Token transfer failed");
        
        // Transfer platform fee to contract
        require(token.transferFrom(msg.sender, address(this), platformFee), "Platform fee transfer failed");
        
        order.status = OrderStatus.Completed;
        
        // Update agent stats
        agents[order.agent].totalDeliveries++;
        
        emit PaymentMade(_orderId, msg.sender, order.agent, agentPayment, false);
        emit OrderCompleted(_orderId, msg.sender, order.agent, agentPayment);
    }

    function getOrder(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }

    function getCustomerOrders(address _customer) external view returns (uint256[] memory) {
        return customerOrders[_customer];
    }

    function getAgentOrders(address _agent) external view returns (uint256[] memory) {
        return agentOrders[_agent];
    }

    function getAgent(address _agent) external view returns (Agent memory) {
        return agents[_agent];
    }

    function withdrawPlatformFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function withdrawTokenFees() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(owner(), balance), "Token withdrawal failed");
    }
}
