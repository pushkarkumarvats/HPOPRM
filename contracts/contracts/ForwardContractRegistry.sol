// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ForwardContractRegistry
 * @dev Registry for forward e-contracts with escrow functionality
 */
contract ForwardContractRegistry {
    enum ContractStatus { Draft, Signed, Active, Settled, Cancelled }
    
    struct Contract {
        string contractId;
        address buyer;
        address seller;
        string commodity;
        uint256 quantity;
        uint256 priceFixed;
        uint256 totalValue;
        uint256 deliveryDate;
        string ipfsHash;
        ContractStatus status;
        uint256 escrowAmount;
        bool buyerSigned;
        bool sellerSigned;
        uint256 createdAt;
    }
    
    mapping(string => Contract) public contracts;
    mapping(address => string[]) public userContracts;
    string[] public allContractIds;
    
    event ContractCreated(string indexed contractId, address indexed buyer, address indexed seller);
    event ContractSigned(string indexed contractId, address indexed signer);
    event EscrowDeposited(string indexed contractId, address indexed depositor, uint256 amount);
    event ContractSettled(string indexed contractId);
    event ContractCancelled(string indexed contractId);
    
    modifier onlyParties(string memory contractId) {
        require(
            msg.sender == contracts[contractId].buyer || 
            msg.sender == contracts[contractId].seller,
            "Not authorized"
        );
        _;
    }
    
    function createContract(
        string memory _contractId,
        address _seller,
        string memory _commodity,
        uint256 _quantity,
        uint256 _priceFixed,
        uint256 _deliveryDate,
        string memory _ipfsHash
    ) external {
        require(contracts[_contractId].buyer == address(0), "Contract exists");
        
        uint256 totalValue = _quantity * _priceFixed;
        
        contracts[_contractId] = Contract({
            contractId: _contractId,
            buyer: msg.sender,
            seller: _seller,
            commodity: _commodity,
            quantity: _quantity,
            priceFixed: _priceFixed,
            totalValue: totalValue,
            deliveryDate: _deliveryDate,
            ipfsHash: _ipfsHash,
            status: ContractStatus.Draft,
            escrowAmount: 0,
            buyerSigned: false,
            sellerSigned: false,
            createdAt: block.timestamp
        });
        
        userContracts[msg.sender].push(_contractId);
        userContracts[_seller].push(_contractId);
        allContractIds.push(_contractId);
        
        emit ContractCreated(_contractId, msg.sender, _seller);
    }
    
    function signContract(string memory _contractId) external onlyParties(_contractId) {
        Contract storage c = contracts[_contractId];
        require(c.status == ContractStatus.Draft, "Invalid status");
        
        if (msg.sender == c.buyer) {
            c.buyerSigned = true;
        } else {
            c.sellerSigned = true;
        }
        
        if (c.buyerSigned && c.sellerSigned) {
            c.status = ContractStatus.Signed;
        }
        
        emit ContractSigned(_contractId, msg.sender);
    }
    
    function depositEscrow(string memory _contractId) external payable onlyParties(_contractId) {
        Contract storage c = contracts[_contractId];
        require(c.status == ContractStatus.Signed, "Not signed");
        
        c.escrowAmount += msg.value;
        
        emit EscrowDeposited(_contractId, msg.sender, msg.value);
    }
    
    function settleContract(string memory _contractId) external onlyParties(_contractId) {
        Contract storage c = contracts[_contractId];
        require(c.status == ContractStatus.Signed, "Not signed");
        require(block.timestamp >= c.deliveryDate, "Not time");
        
        c.status = ContractStatus.Settled;
        
        if (c.escrowAmount > 0) {
            payable(c.seller).transfer(c.escrowAmount);
        }
        
        emit ContractSettled(_contractId);
    }
    
    function getContract(string memory _contractId) external view returns (Contract memory) {
        return contracts[_contractId];
    }
    
    function getUserContracts(address _user) external view returns (string[] memory) {
        return userContracts[_user];
    }
}
