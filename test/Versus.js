const { expect } = require('chai');
const { ethers } = require('hardhat');
const { providers } = require('web3');

const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

describe('Versus', () => {
  let versusDeployed, Versus
  const provider = waffle.provider;

  before(async () => {
    Versus = await ethers.getContractFactory('Versus');
    versusDeployed = await Versus.deploy();
    await versusDeployed.deployed();
    accounts = await ethers.getSigners();
  });

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      expect(versusDeployed.address).to.not.equal(0x0);
      expect(versusDeployed.address).to.not.equal('');
      expect(versusDeployed.address).to.not.equal(null);
      expect(versusDeployed.address).to.not.equal(undefined);
    });
  });

  describe('deposit eth player1', async () => {
    let initialPlayerBalance=0;
    let depositAmountInWei=0;

    it('funds received', async () => {
      let depositAmount = 0.1;
      depositAmountInWei = toWei(depositAmount); 
      let initialContractBalance = await provider.getBalance(versusDeployed.address);
      initialPlayerBalance = await versusDeployed.getPlayerBalance(accounts[1].address);
      await accounts[1].sendTransaction({value: depositAmountInWei, to: versusDeployed.address});
      //await versusDeployed.connect(accounts[1]).depositFunds(depositAmountInWei, {value: depositAmountInWei});

      let contractBalance = await provider.getBalance(versusDeployed.address);
      expect(Number(contractBalance)).to.equal(Number(initialContractBalance)+Number(depositAmountInWei));
    });

    it('player balance updated', async () => {
      let playerBalance = await versusDeployed.getPlayerBalance(accounts[1].address);
      expect(Number(playerBalance)).to.equal(Number(initialPlayerBalance)+Number(depositAmountInWei));
    });
  });

  describe('deposit eth player2', async () => {
    let initialPlayerBalance=0;
    let depositAmountInWei=0;

    it('funds received', async () => {
      let depositAmount = 0.1;
      depositAmountInWei = toWei(depositAmount); 
      let initialContractBalance = await provider.getBalance(versusDeployed.address);
      initialPlayerBalance = await versusDeployed.getPlayerBalance(accounts[2].address);
      await accounts[2].sendTransaction({value: depositAmountInWei, to: versusDeployed.address});
      //await versusDeployed.connect(accounts[2]).depositFunds(depositAmountInWei, {value: depositAmountInWei});

      let contractBalance = await provider.getBalance(versusDeployed.address);
      expect(Number(contractBalance)).to.equal(Number(initialContractBalance)+Number(depositAmountInWei));
    });

    it('player balance updated', async () => {
      let playerBalance = await versusDeployed.getPlayerBalance(accounts[2].address);
      expect(Number(playerBalance)).to.equal(Number(initialPlayerBalance)+Number(depositAmountInWei));
    });
  });


  describe('Start Game', async () => {
    let wager = 0.05;
    let wagerInWei = toWei(wager);
    let gameId = 1;

    it('pending game created', async () => {
      let player1InitialBalance = await versusDeployed.getPlayerBalance(accounts[1].address);

      const idOut = await versusDeployed.connect(accounts[1]).newGame(wagerInWei);

      //TODO: get id from event
      //TODO: figure out how to listen to events
      //console.log(idOut.args)

      let {id, amount, player1, isValid} = await versusDeployed.pendingGames(gameId);
      let player1Balance = await versusDeployed.getPlayerBalance(accounts[1].address);

      expect(Number(player1Balance)).to.equal(player1InitialBalance-wagerInWei, 'player1 balance deducted');
      expect(id).to.equal(gameId);
      expect(amount).to.equal(wagerInWei);
      expect(player1).to.equal(accounts[1].address);
      expect(isValid).to.equal(true);
    });

    it('player 2 joins game', async () => {
      let player2InitialBalance = await versusDeployed.getPlayerBalance(accounts[2].address)

      await versusDeployed.connect(accounts[2]).joinGame(gameId);
      
      //test getters for game and player info for in progress game
      const {0: player11, 1: link11, 2: player21, 3:link21} = await versusDeployed.getinProgressGamePlayerFields(accounts[2].address)
      const {0: amount1, 1: isValid1} = await versusDeployed.getinProgressGameGameFields(accounts[2].address)

      //test getter for all fields
      const {0: amount2,1:player12,2:link12,3:player22,4:link22,5:isValid2} = await versusDeployed.getinProgressGameFields(accounts[1].address)

      let player2Balance = await versusDeployed.getPlayerBalance(accounts[2].address)
      const {0: pendingId, 1:pendingAmount, 2:pendingPlayer1, 3:pendingIsValid} = await versusDeployed.pendingGames(gameId)

      expect(Number(fromWei(player2Balance))).to.equal(fromWei(player2InitialBalance)-fromWei(wagerInWei));//, 'player2 balance deducted');
      
      expect(fromWei(amount1)).to.equal(fromWei(wagerInWei));
      expect(player11).to.equal(accounts[1].address);
      expect(link11).to.equal('link_to_server_1');
      expect(player21).to.equal(accounts[2].address);
      expect(link21).to.equal('link_to_server_2');
      expect(isValid1).to.equal(true);

      expect(fromWei(amount2)).to.equal( fromWei(wagerInWei));
      expect(player12).to.equal(accounts[1].address);
      expect(link12).to.equal('link_to_server_1');
      expect(player22).to.equal(accounts[2].address);
      expect(link22).to.equal('link_to_server_2');
      expect(isValid2).to.equal(true);

      expect(pendingIsValid).to.equal(false, "Pending game is now not valid");
    });
  });

  describe('End Game', async () => {
    
    it('Game ended by wrong account', async () => {
      await expect(versusDeployed.connect(accounts[5]).endGame(accounts[1].address)).to.be.reverted;
    });

    //let player = accounts[1].address;
    let player1;
    let player2;
    let player1InitialBalance;
    let player2InitialBalance;
    let player1Wins = true;

    if(player1Wins){
      it('Player1 Wins', async () => {
        //get player1 address
        const {0: amount ,1:player1,2:link1,3:player2,4:link2,5:isValid} = await versusDeployed.getinProgressGameFields(accounts[1].address);
        
        player1InitialBalance = await versusDeployed.getPlayerBalance(player1);
        player2InitialBalance = await versusDeployed.getPlayerBalance(player2);
        
        await versusDeployed.connect(accounts[1]).endGame(player1);

        let player1Balance = await versusDeployed.getPlayerBalance(player1);
        let player2Balance = await versusDeployed.getPlayerBalance(player2);

        const {0: amount1, 1: isValid1} = await versusDeployed.getinProgressGameGameFields(accounts[2].address);

        expect(player1InitialBalance.add(amount.mul(2)).toString()).to.equal(player1Balance.toString());
        expect(fromWei(player2InitialBalance), fromWei(player2Balance));
        expect(isValid1).to.equal(false);
      });
    }else{
      it('Player2 Wins', async () => {

      });
    }
  });


  describe('withdraw eth player 1', async () => {
    //use below lines if you DO NOT want to completely empty the account
    //let withdrawnAmount = 0.05
    //let amountInWei = toWei(withdrawnAmount);
    
    let amountInWei;
    let contractInitialBalance;
    let contractBalance;

    let playerInitialBalance;
    let playerBalance;

    it('funds taken from contract balance', async () => {
      //empty entire account balance, comment next line out to set amount in wei above
      amountInWei = await versusDeployed.getPlayerBalance(accounts[1].address);
      
      contractInitialBalance = await provider.getBalance(versusDeployed.address);
      playerInitialBalance = await versusDeployed.getPlayerBalance(accounts[1].address);
      
      await versusDeployed.connect(accounts[1]).withdrawEther(amountInWei);
      contractBalance = await provider.getBalance(versusDeployed.address);

      expect(contractBalance.toString()).to.equal(contractInitialBalance.sub(amountInWei).toString());
    })

    it('player balance updated', async () => {
      playerBalance = await versusDeployed.getPlayerBalance(accounts[1].address);
      expect(playerBalance).to.equal(playerInitialBalance.sub(amountInWei));
    })
  })
});
