// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface IPayroll
{
    

    function addEmployee(
        address _employeeAddress, 
        string memory name , 
        string memory email , 
        string memory employeetype ,
        uint256 _initialYearlyUSDSalary) external;

    

}