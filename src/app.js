App = {

    loading: false,
    contracts: {},


    load : async() => 
    {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
        await App.checkCompanyDetails()
        await App.loadEmployeeList()
    },

    loadWeb3 : async()=>
    {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider
            web3 = new Web3(web3.currentProvider)
          } else {
            window.alert("Please connect to Metamask.")
          }
          // Modern dapp browsers...
          if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
              // Request account access if needed
              await ethereum.enable()
              // Acccounts now exposed
              web3.eth.sendTransaction({/* ... */})
            } catch (error) {
              // User denied account access...
            }
          }
          // Legacy dapp browsers...
          else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({/* ... */})
          }
          // Non-dapp browsers...
          else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
          }
    },

    loadAccount : async() =>
    {
            App.account = web3.eth.accounts[0]

            //setting default account
            web3.eth.defaultAccount = web3.eth.accounts[0]
              // getting an updating ETH Balance 
              web3.eth.getBalance(App.account, function(err, balance) {
                if (err === null) {
                    $('#ETHbalance').html(web3.fromWei(balance, "ether") + " ETH");
                }
              });
            
          

    },
    render: async () => {
        // Prevent double render
        if (App.loading) {
          return
        }
    
        // Update app loading state
        App.setLoading(true)
    
        // Render Account
        $('#account').html(App.account)
    
        // Render Tasks
        //await App.renderTasks()
    
        // Update loading state
        App.setLoading(false)
      },

    loadContract: async () => {
        // Creating a JavaScript version of the smart contract
        const payroll = await $.getJSON('Payroll.json')
        App.contracts.Payroll = TruffleContract(payroll)
        App.contracts.Payroll.setProvider(App.web3Provider)
    
        // Hydrate the smart contract with values from the blockchain
        App.payroll = await App.contracts.Payroll.deployed()
      },
      createComapny: async () => {
        App.setLoading(true)

        const daoCOunt =  await App.payroll.CompanyCount()
        var dID  = Number(daoCOunt.toString())+1
        const daoName = $('#daoName').val()
        const daoDescription = $('#daoDescription').val()
        const daowebsite = $('#daoWebsite').val()
        console.log(web3.eth.accounts[0])
        await App.payroll.createCompany(App.account ,daoName , daoDescription,daowebsite,dID)
        App.DaoID = dID
        window.location.reload()
      },
      sendEther: async () => {
        App.setLoading(true)

       
        const EmpID = $('#EmployeeSelectList').find(':selected').data('eid')
        const EmpLoyeeAddress = $('#EmployeeSelectList').find(':selected').data('address')
        const amount = $('#amount').val()
        // console.log(EmpLoyeeAddress,Number(amount),Number(EmpID))
        await App.payroll.SendEther(EmpLoyeeAddress,Number(amount),Number(EmpID))
       
        window.location.reload()
      },

      addEmployee: async () => {
        App.setLoading(true)

        const empCOunt =  await App.payroll.employeeCount()
        var EmpID  = Number(empCOunt.toString())+1
        $('#LblTotalEmployees').val(empCOunt.toString())
        const empWAddress = $('#empWAddress').val()
        const empName = $('#empName').val()
        const empEmail = $('#empEmail').val()
        const empType = $('#EmpLoyeeType').val()
        const empYearlySalary = $('#empYSalary').val()
        console.log(empType);
        await App.payroll.addEmployee(EmpID,empWAddress,empName , empEmail, empType,BigInt(empYearlySalary) )
        window.location.reload()
      },

      checkCompanyDetails: async () => {
        try{
            var companyName ="";
            if(App.dID==0 || App.dID==undefined)
            {
                companyName = await App.payroll.checkCompanyDetails(1);
            }else
            {
                companyName = await App.payroll.checkCompanyDetails(App.dID);
            }
            
            if (companyName.length==0)
            {
                $('#DaoModal').modal('show');
            }else
            {
                $('#RegdaoName').html(companyName)
            }
        }
      catch(err)
      {
        console.log(err);
      }
      },  

      loadEmployeeList: async () =>
      {
        const EmpCount = await App.payroll.employeeCount()
        const $EmpTemplate = $('.Emptemplate')
        $('#LblTotalEmployees').html(EmpCount.toString())

    // Render out each employee with a new Employee template
    for (var i = 1; i <= EmpCount; i++) {
      // Fetch the employee data from the blockchain
      const employee = await App.payroll.employeeList(i)
      const EmpWalletAddress = employee[0]
      const EmpName = employee[1]
      const EmpEmail = employee[2]
      const EmpType = employee[3]
      const EMpYearlySalaryUSD = employee[4].toNumber()
      
      

      // Create the html for the Employee
      const $newEmpTemplate = $EmpTemplate.clone()
      $newEmpTemplate.find('.EmpSNo').html(i)
      $newEmpTemplate.find('.ETempWalletAdr').html("<a href='https://etherscan.io/address/"+EmpWalletAddress+"'>"+EmpWalletAddress+"</a>")
      $newEmpTemplate.find('.ETempName').html(EmpName)
      $newEmpTemplate.find('.ETempMail').html(EmpEmail)
      $newEmpTemplate.find('.EtempType').html(EmpType)
      $newEmpTemplate.find('.ETempSalary').html(EMpYearlySalaryUSD)
      $('#EmployeeList').append($newEmpTemplate)
      $newEmpTemplate.show()

      const $SelectEmptemplate  =  $('.empSelectTemplate')
      const $newSelectEmptemplate =  $SelectEmptemplate.clone()
      $newSelectEmptemplate.attr('data-eid' ,i)
      $newSelectEmptemplate.attr('data-address' ,EmpWalletAddress)
      $newSelectEmptemplate.html(EmpName)
      $('#EmployeeSelectList').append($newSelectEmptemplate)
     
     
    }
      },

      setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
          loader.show()
          content.hide()
        } else {
          loader.hide()
          content.show()
        }
      }

}

$(()=> {
    $(window).load(()=>{
      
        App.load();
    })

    $('#btnAddEmployee').on('click',function(){
        $('#EmployeeModal').modal('show');
        })

    $('#btnRegDao').on('click',function(){
        App.createComapny();
        })


        $('#btnRegEmp').on('click',function(){
            App.addEmployee();
            })

            $('#btnPayEmployee').on('click',function(){
                $('#PayModal').modal('show');
                })


                $('#btnTransfer').on('click',function(){
                    App.sendEther();
                    })
        
})


