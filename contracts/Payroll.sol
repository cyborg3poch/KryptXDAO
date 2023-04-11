// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Payroll
{

    struct Company {
        address id;
        string name;
        string description;
        string website;
        address owner;
        uint createdAt;
        bool paused;
    }



 struct Employee {
        address id;
        string name ;
        string email ;
        string employeeType;
        uint256 yearlyUSDSalary;
        uint256 totalReceivedUSD;
        uint256 totalDistributed;
        
    }


struct Payment {
        address to;
        address sourceToken;
        address targetToken;
        uint targetAmount;
        uint sourceAmount;
        uint minRate;
        uint maxRate;
    }


/* STATE VARIABLES */
    
    address private owner;
    address private oracle;
    uint256 public employeeCount = 0;
    uint256 public CompanyCount = 0;

    mapping(uint256 => Employee) public employeeList;

    mapping (uint256 => Company) private companyList ; 

    uint256 private totalYearlyUSDSalary;


     /* HELPERS */

    /* Checks if the employee is registered in the payroll */
    function exists(uint256 _employeeID)
    internal
    view
    returns (bool)
    {
        return employeeList[_employeeID].id != address(0x0);
    }

 /* CONSTRUCTOR */
 constructor()
 {
     owner = msg.sender;
 }


/* ACCESS RULES */
    modifier onlyByOwner() {
        require(msg.sender == owner);
        _;
    }
    modifier onlyByEmployee(uint256 _employeeID) {
        require(exists(_employeeID));
        _;
    }
   
   
    modifier onlyPositive(uint256 _value) {
        require(_value > 0);
        _;
    }
    modifier onlyRegistered(uint256 _employeeID ) {
        require(exists(_employeeID),  "Employee Not Registered");
        _;
    }
    modifier onlyNotRegistered(uint256 _employeeID) {
        require(!exists(_employeeID) , "Employee Registered");
        _;
    }


     modifier existCompany(uint256 _companyid) {
        require(companyList[_companyid].id != address(0x0), "Company definition doesn't exist.");
        _;
    }

    modifier NotexistCompany(uint256 _companyid) {
        require(companyList[_companyid].id == address(0x0), "Company definition already exist.");
        _;
    }
    
   

    function createCompany(
        address _comapnyAddress, 
        string memory name , 
        string memory description , 
        string memory website ,
        uint256 company_id
        )
    external
    onlyByOwner
    NotexistCompany(company_id)
    {
        Company storage c = companyList[company_id];
        c.id = _comapnyAddress ;
        c.name = name; 
        c.description = description ; 
        c.website = website ; 
        c.owner = msg.sender ; 
        c.createdAt = block.timestamp ; 
        c.paused = false ;  
        CompanyCount++;

    }


    function checkCompanyDetails(uint256 _companyId) view
    external
     onlyByOwner
     returns (string memory companyName ) 
    {
        return companyList[_companyId].name;
    }

    /*  Adds an employee into the payroll if it is not already registered and has valid tokens and salary */
    function addEmployee(
        uint256 _employeeID, 
        address _employeeAddress, 
        string memory name , 
        string memory email , 
        string memory employeetype ,
        uint256 _initialYearlyUSDSalary)
    external
    onlyByOwner
    onlyNotRegistered(_employeeID)
    onlyPositive(_initialYearlyUSDSalary)
    {
        employeeCount++;
        totalYearlyUSDSalary = totalYearlyUSDSalary + _initialYearlyUSDSalary;
       
       // employeesMap[_employeeAddress] = Employee(_employeeAddress, _initialYearlyEURSalary, 0, 0);

       Employee storage e = employeeList[_employeeID] ; 
       e.id = _employeeAddress ; 
       e.email = email ;
       e.name = name ; 
       e.employeeType = employeetype ; 
       e.yearlyUSDSalary = _initialYearlyUSDSalary ;
      

    }

/*  Removes the employee from the payroll if it is registered in the payroll */
    function removeEmployee(uint256 _employeeID)
    external
    onlyByOwner
    onlyRegistered(_employeeID)
    {
        employeeCount = employeeCount - 1;
        totalYearlyUSDSalary = totalYearlyUSDSalary - employeeList[_employeeID].yearlyUSDSalary;
        delete employeeList[_employeeID];
       
       
    }

    function SendEther(address  _employeeWalletAddress , uint256 amount , uint256 _employeeID )
    payable
    external
    onlyByOwner
    onlyRegistered(_employeeID)
    {
        require(msg.sender.balance >= amount, "Balance is low");
       address payable receiver = payable(_employeeWalletAddress);
       // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
        (bool sent, bytes memory data) = receiver.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }


}