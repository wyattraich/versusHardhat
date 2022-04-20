import React, { Component } from 'react';
import Navbar from './Navbar'
import Main from './Main'
import InProgress from './inProgress'
import Waiting from './Waiting'
import Web3 from 'web3'
import Versus from '../abis/Versus.json'
import $ from 'jquery'
import './App.css';

//TODO if player has an open game, wait and listen for event where 
//someone joins their open game and it becomes in progress, then show links
//TODO wait for events of new games and refresh each time a new game is added
//TODO if player logs out with pending game, cancel it and refund

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.getPendingGames()
  }

  /** !UPDATE **/
  async loadWeb3() {
    if(typeof window.ethereum!=='undefined' && !this.state.wrongNetwork){
      let accounts, network, balance, web3, playerBalance, contract, contract_abi, contract_address

      //don't refresh DApp when user change the network
      window.ethereum.autoRefreshOnNetworkChange = false;

      //USE THIS WHEN DEPLOYING ON REAL NET
      //web3 = new Web3(window.ethereum)
      //this.setState({web3: web3})

      //contract_abi = [{"anonymous": false,"inputs": [{"indexed": true,"internalType": "address","name": "sender","type": "address"},{"indexed": false,"internalType": "uint256","name": "amount","type": "uint256"}],"name": "Received","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "uint256","name": "id","type": "uint256"},{"indexed": false,"internalType": "uint256","name": "bet","type": "uint256"},{"indexed": false,"internalType": "uint256","name": "randomSeed","type": "uint256"},{"indexed": false,"internalType": "uint256","name": "amount","type": "uint256"},{"indexed": false,"internalType": "address","name": "player","type": "address"},{"indexed": false,"internalType": "uint256","name": "winAmount","type": "uint256"},{"indexed": false,"internalType": "uint256","name": "randomResult","type": "uint256"},{"indexed": false,"internalType": "uint256","name": "time","type": "uint256"}],"name": "Result","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "address","name": "admin","type": "address"},{"indexed": false,"internalType": "uint256","name": "amount","type": "uint256"}],"name": "Withdraw","type": "event"},{"inputs": [{"internalType": "uint256","name": "bet","type": "uint256"},{"internalType": "uint256","name": "seed","type": "uint256"}],"name": "game","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "payable","type": "function"},{"inputs": [{"internalType": "bytes32","name": "requestId","type": "bytes32"},{"internalType": "uint256","name": "randomness","type": "uint256"}],"name": "rawFulfillRandomness","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "bytes32","name": "_keyHash","type": "bytes32"},{"internalType": "uint256","name": "_fee","type": "uint256"},{"internalType": "uint256","name": "_seed","type": "uint256"}],"name": "requestRandomness","outputs": [{"internalType": "bytes32","name": "requestId","type": "bytes32"}],"stateMutability": "nonpayable","type": "function"},{"stateMutability": "payable","type": "receive"},{"inputs": [{"internalType": "uint256","name": "random","type": "uint256"}],"name": "verdict","outputs": [],"stateMutability": "payable","type": "function"},{"inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],"name": "withdrawEther","outputs": [],"stateMutability": "payable","type": "function"},{"inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],"name": "withdrawLink","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"stateMutability": "nonpayable","type": "constructor"},{"inputs": [],"name": "admin","outputs": [{"internalType": "address payable","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "ethInUsd","outputs": [{"internalType": "int256","name": "","type": "int256"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "gameId","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "","type": "uint256"}],"name": "games","outputs": [{"internalType": "uint256","name": "id","type": "uint256"},{"internalType": "uint256","name": "bet","type": "uint256"},{"internalType": "uint256","name": "seed","type": "uint256"},{"internalType": "uint256","name": "amount","type": "uint256"},{"internalType": "address payable","name": "player","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "lastGameId","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "bytes32","name": "","type": "bytes32"}],"name": "nonces","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "randomResult","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "weiInUsd","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"}]
      //contract_address = '0x2FeF79F6b8777D4C13E2D7be422628A5B458b7ad' //rinkeby
      //contract = new web3.eth.Contract(contract_abi, contract_address);

      //INITIALIZE CONTRACT FROM GANACHE ***********************
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()
      }
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
      }
      else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
      web3 = window.web3
      const networkId = await web3.eth.net.getId()
      const networkData = Versus.networks[networkId]
      if(networkData) {
        const abi = Versus.abi
        const address = networkData.address
        contract = new web3.eth.Contract(abi, address)
      }
      //*********************************************

      this.setState({
        contract: contract,
        contractAddress: contract_address,
        web3: web3
      })

      accounts = await web3.eth.getAccounts()

      //Update the data when user initially connect
      if(typeof accounts[0]!=='undefined' && accounts[0]!==null) {
        console.log("load web3 initial connection")
        balance = await web3.eth.getBalance(accounts[0])
        playerBalance = await contract.methods.getPlayerBalance(accounts[0]).call()
        this.setState({account: accounts[0],pageState: "Main", balance: balance, playerBalance: playerBalance})
      }

      //Update account&balance when user change the account
      window.ethereum.on('accountsChanged', async (accounts) => {
        console.log("load web3 accounts changed")
        if(typeof accounts[0] !== 'undefined'  && accounts[0]!==null){
          console.log("account valid")
          balance = await web3.eth.getBalance(accounts[0])
          playerBalance = await contract.methods.getPlayerBalance(accounts[0]).call()
          this.setState({account: accounts[0], pageState: "Main", balance: balance, playerBalance: playerBalance})
        } else {
          console.log("account invalid")
          this.setState({account: null, balance: 0})
        }
      });

      //Update data when user switch the network
      window.ethereum.on('chainChanged', async (chainId) => {
        console.log("load web3 network changed")
        network = parseInt(chainId, 16)
        if(network!==4){
          this.setState({wrongNetwork: true})
        } else {
          if(this.state.account){
            balance = await this.state.web3.eth.getBalance(this.state.account)
            playerBalance = await contract.methods.getPlayerBalance.call(accounts[0])

            this.setState({ balance: balance, playerBalance: playerBalance })
          }
          this.setState({ network: network, pageState: "Main", onlyNetwork: false, wrongNetwork: false})
        }
      });
    }
  }

  listenForEvents() {
    this.state.contract.Election.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.NewGame({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        this.state.render();
      });

      instance.NewGame({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        this.state.render();
      });
    });
  }

  async newGame(amount) {
    //UNCOMMENT FOR REAL NET
    //const networkId = await this.state.web3.eth.net.getId()
    //if(networkId!==4) {
    //  this.setState({wrongNetwork: true})
    //} else

    if(typeof this.state.account !=='undefined' && this.state.account !==null){
      //Send new game to the contract and wait for someone to join
      let wagerInWei = await this.state.web3.utils.toWei(amount.toString(), 'ether')
      console.log(wagerInWei)
      this.state.contract.methods.newGame(amount).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({pageState: "Waiting", pendingGameAmount: amount})
        console.log(this.state.pageState)
      });


      //in waiting wait for join event, have cancel option for pending game
    
      //refresh balances and pending games
      //let balance = await this.state.web3.eth.getBalance(this.state.account)
      //let playerBalance = await this.state.contract.methods.getPlayerBalance(this.state.account).call()
      //this.setState({ balance: balance, playerBalance: playerBalance })
      //this.getPendingGames()

        /*this.state.contract.methods.game(bet, randomSeed).send({from: this.state.account, value: amount}).on('transactionHash', (hash) => {
          this.setState({ loading: true })
          this.state.contract.events.Result({}, async (error, event) => {
            const verdict = event.returnValues.winAmount
            if(verdict === '0') {
              window.alert('lose :(')
            } else {
              window.alert('WIN!')
            }

          //Prevent error when user logout, while waiting for the verdict
          if(this.state.account!==null && typeof this.state.account!=='undefined'){
            const balance = await this.state.web3.eth.getBalance(this.state.account)
            const playerBalance = await this.state.web3.eth.getBalance(this.state.contractAddress)
            this.setState({ balance: balance, playerBalance: playerBalance })
          }
          this.setState({ loading: false })
        })
      }).on('error', (error) => {
        window.alert('Error')
      })*/
    } else {
      window.alert('Problem with account or network')
    }
  }

  async joinGame(id) {
    //UNCOMMENT FOR REAL NET
    //const networkId = await this.state.web3.eth.net.getId()
    //if(networkId!==4) {
    //  this.setState({wrongNetwork: true})
    //} else

    console.log("JOIN GAME")

    if(typeof this.state.account !=='undefined' && this.state.account !==null){
      //Send new game to the contract and wait for someone to join
      console.log(id)
      await this.state.contract.methods.joinGame(id).send({from: this.state.account})
      console.log("Game Joined")

      const {0: amount2,1:player12,2:link12,3:player22,4:link22,5:isValid2} = await this.state.contract.methods.getinProgressGameFields.call(this.state.account)
      console.log(this.state.account,amount2,player12,link12,player22,link22,isValid2)

      if(this.state.account === player12){
        this.setState({link: link12})
      }else{
        this.setState({link: link22})
      }

      this.setState({pageState: "inProgress"})

    } else {
      window.alert('Problem with account or network')
    }
  }

  // listen for join game for in progress game of your address
  //when in progress switch to in progress and display link for the waiting player
  //have finish game button that can be selected by either user but will not execute
  //until we get a successful api response about who won game or if it was cancelled
  //before starting


  async getPendingGames() {
    var pendingGames = $("#pendingGames");
    pendingGames.empty();

    let numPendingGames = await this.state.contract.methods.getPendingGameId().call()
    //console.log(Number(numPendingGames))
    for (var i = 1; i <= Number(numPendingGames); i++){
      const {0: id, 1: amount, 2: player, 3:isValid} = await this.state.contract.methods.getPendingGameFields(i).call()
      //console.log(i, id, amount, player, isValid)
      let amountEth = await this.state.web3.utils.fromWei(amount.toString(), 'ether')
      // Render candidate Result
      if(isValid){
        var pendingGameTemplate = "<tr><td id='id'>" + id + "</td><td id='player'>" + player.toString().substring(0,5) + "..." + player.toString().substring(37,43) + "</td><td id='amount'>" + amountEth + "</td><td><button class='btn btn-success btn-lg'> Join Game </button> </td><tr>"
        pendingGames.append(pendingGameTemplate);
      }
    }

    //TODO: CHANGE TO PROXY FUNCTION OR BIND, this is hacky
    var self = this;
    pendingGames.on("click",".btn",function(ev){
      var retval = $(ev.target).closest('tr').find('#id').text()
      var playerJoin = $(ev.target).closest('tr').find('#player').text()
      var amount = $(ev.target).closest('tr').find('#amount').text()
      self.joinGame(retval)
      console.log(retval, playerJoin ,amount)
    });
  }

  async getPendingGamesNoJoin() {
    var pendingGames = $("#pendingGamesNoJoin");
    pendingGames.empty();

    let numPendingGames = await this.state.contract.methods.getPendingGameId().call()
    //console.log(Number(numPendingGames))
    for (var i = 1; i <= Number(numPendingGames); i++){
      const {0: id, 1: amount, 2: player, 3:isValid} = await this.state.contract.methods.getPendingGameFields(i).call()
      //console.log(i, id, amount, player, isValid)
      let amountEth = await this.state.web3.utils.fromWei(amount.toString(), 'ether')
      // Render candidate Result
      if(isValid){
        var pendingGameTemplate = "<tr><td id='id'>" + id + "</td><td id='player'>" + player.toString().substring(0,5) + "..." + player.toString().substring(37,43) + "</td><td id='amount'>" + amountEth + "</td><tr>"
        pendingGames.append(pendingGameTemplate);
      }
    }
  }

  onChange(value) {
    this.setState({'amount': value});
  }

  constructor(props) {
    super(props)
    this.state = {
      account: null,
      amount: null,
      balance: null,
      contract: null,
      event: null,
      pageState: null,
      network: null,
      playerBalance: 0,
      web3: null,
      wrongNetwork: false,
      contractAddress: null,
      pendingGameAmount: null
    }

    this.makeGame = this.newGame.bind(this)
    this.joinGame = this.joinGame.bind(this)
    this.getPendingGames = this.getPendingGames.bind(this)
    this.getPendingGamesNoJoin = this.getPendingGamesNoJoin.bind(this)
    this.setState = this.setState.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  render() {
    console.log("rendering")
    console.log(this.state.pageState)
    return (
      <div>
        <Navbar account={this.state.account}/>&nbsp;
        {this.state.wrongNetwork
          ? <div className="container-fluid mt-5 text-monospace text-center mr-auto ml-auto">
              <div className="content mr-auto ml-auto">
                <h1>Please Enter Rinkeby Network</h1>
              </div>
            </div>
          : this.state.pageState === 'Waiting'
              ? <Waiting
                balance={this.state.balance}
                playerBalance={this.state.playerBalance}
                getPendingGames={this.getPendingGamesNoJoin}
                web3={this.state.web3}
                pendingGameAmount={this.state.pendingGameAmount}
                />
              : this.state.pageState === 'Main'
                ? <Main
                    amount={this.state.amount}
                    balance={this.state.balance}
                    makeGame={this.makeGame}
                    getPendingGames={this.getPendingGames}
                    onChange={this.onChange}
                    playerBalance={this.state.playerBalance}
                    web3={this.state.web3}
                  />
                :
                  <InProgress
                    web3={this.state.web3}
                    link={this.state.link}
                  />
        }
      </div>
    );
  }
}

export default App;