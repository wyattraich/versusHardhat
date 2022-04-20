// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/Ownable.sol)

pragma solidity ^0.8.0;
import 'hardhat/console.sol';

//import "https://raw.githubusercontent.com/smartcontractkit/chainlink/master/evm-contracts/src/v0.6/VRFConsumerBase.sol";
//import "https://github.com/smartcontractkit/chainlink/blob/master/evm-contracts/src/v0.6/interfaces/AggregatorV3Interface.sol"; /* !UPDATE, import aggregator contract */

contract Versus {
  //TODO limit player to one open game
  //TODO do not let player join a game if they have an open game
  //TODO add function canceling pending games

  //TODO come up with a way better keep track of pending games so when we iterate through them to 
  // display on front end, we are not iterating through every game ever pending. maybe when one game is
  // completed, put that id into an available vector and only ++ pendingGameId if that vector
  // is empty
  //TODO add in taking tax for versus and game dev
  //TODO support game dev tax
  //TODO add oracles
  //TODO additional requires: new game amount > 0
  //TODO add depotsit funds button

  //TODO support multiple games
  //TODO support multiple players

  //All for halting games for a contract/site upgrade
  //TODO add functions for stopping any new games being created
  //TODO add function that shows number of in progress games
  //TODO add function that pays out all accounts automatically

  uint256 private _maxFee = 10;
  uint256 private _fee = 3;
  uint256 private _pendingGameId;
  uint256 private inProgressGameId;

  mapping(uint256 => pendingGame) public pendingGames;
  mapping(address => inProgressGame) private inProgressGames;
  mapping(address => player) private playerInfo;

  string link1;
  string link2;

  struct player{
    uint256 balance;
    bool hasPendingGame;
    uint256 pendingGameId;
  }

  struct pendingGame{
    uint256 id;
    uint256 amount;
    address player1;
    bool isValid;
  }

  struct inProgressGame{
    uint256 amount;
    address  player1;
    string link1;
    address player2;
    string link2;
    bool isValid;
  }

  event Withdraw(address admin, uint256 amount);
  event Result(address player1, address player2, address winner, uint256 winAmount, uint256 time);
  event Received(address indexed sender, uint256 amount);
  event InProgressGame(uint256 amount, address player1, string link1, address player2, string link2);
  event CancelledGame(uint256 gameId);
  event NewGame(uint256 gameId);

  /* Allows this contract to receive payments with deposit function
  function depositFunds(uint256 amount) external payable {
    playerInfo[msg.sender].balance+=amount;
    emit Received(msg.sender, amount);
  }*/
  
  receive() external payable {
    playerInfo[msg.sender].balance+=msg.value;
    emit Received(msg.sender, msg.value);
  }

  //All of the getters
  function getContractBalance() public view returns (uint256) {
      return address(this).balance;
  }

  function getPlayerBalance(address account) public view returns (uint256) {
    return playerInfo[account].balance;
  }

  function getPlayerInfo(address account) public view returns (uint256, bool, uint256) {
    return (playerInfo[account].balance, playerInfo[account].hasPendingGame, playerInfo[account].pendingGameId);
  }

  //Pending Games
  function getPendingGameId() public view returns (uint256) {
    return _pendingGameId;
  }

  function getPendingGameFields(uint256 pendingGameId) public view returns (uint256, uint256, address, bool){
    return (pendingGames[pendingGameId].id, pendingGames[pendingGameId].amount, pendingGames[pendingGameId].player1, pendingGames[pendingGameId].isValid);
  }

  //In progress Games
  function getinProgressGameFields(address idIn) public view returns (uint256, address, string memory, address, string memory, bool){
    return (inProgressGames[idIn].amount, inProgressGames[idIn].player1, inProgressGames[idIn].link1, inProgressGames[idIn].player2, inProgressGames[idIn].link2, inProgressGames[idIn].isValid);
  }

  function getinProgressGameGameFields(address idIn) public view returns (uint256, bool){
    return (inProgressGames[idIn].amount, inProgressGames[idIn].isValid);
  }

  function getinProgressGamePlayerFields(address idIn) public view returns (address, string memory, address, string memory){
    return (inProgressGames[idIn].player1, inProgressGames[idIn].link1,inProgressGames[idIn].player2, inProgressGames[idIn].link2);
  }

  /*function setFeePercent(uint256 fee) external onlyOwner() {
    require(fee <= _maxFee, "Invalid fee, too high"); //fix 02 WORKS
    _fee = fee;
  }*/

  /**
   * Taking bets function.
   * By winning, user 2x his betAmount.
   * Chances to win and lose are the same.
   */
  function newGame(uint256 wager) public returns (uint256) {
    //vault balance must be at least equal to wager
    require(playerInfo[msg.sender].balance>=wager, 'Error, insufficent account balance');
    require(!playerInfo[msg.sender].hasPendingGame, 'Error, player can only have one pending game at a time');
    require(!inProgressGames[msg.sender].isValid, "Error, cannot start a new game while in another in progress game");

    _pendingGameId+=1;
    uint256 pendingGameIdLocal = _pendingGameId;

    pendingGames[pendingGameIdLocal] = pendingGame(pendingGameIdLocal, wager, msg.sender, true);

    playerInfo[msg.sender].balance-=wager;
    playerInfo[msg.sender].hasPendingGame = true;
    playerInfo[msg.sender].pendingGameId = pendingGameIdLocal;

    emit NewGame(pendingGameIdLocal);
    return pendingGameIdLocal;
  }

  function cancelPendingGame() public {
    require(playerInfo[msg.sender].hasPendingGame, 'Error, player can only cancel a game if the have one pending');

    //set game to not valid, basically erase it
    pendingGames[playerInfo[msg.sender].pendingGameId].isValid = false;

    //reset player fields, refund wager amount, no pending game
    playerInfo[msg.sender].balance+=pendingGames[playerInfo[msg.sender].pendingGameId].amount;
    playerInfo[msg.sender].hasPendingGame = false;

    emit CancelledGame(playerInfo[msg.sender].pendingGameId);

    playerInfo[msg.sender].pendingGameId = 0;
  }

  function joinGame(uint256 pendingGameId) public {
    require(playerInfo[msg.sender].balance>=pendingGames[pendingGameId].amount, 'Error, insufficent account balance to join game.');
    require(pendingGames[pendingGameId].player1 != msg.sender, "Error, Cannot join your own game");
    require(!inProgressGames[msg.sender].isValid, "Error, cannot join game while already in another in progress game");

    //call to oracle to setup lobby
    //call to oracle to get link to lobby and send inProgressGameId for it to keep track of
    link1 = "link_to_server_1";
    link2 = "link_to_server_2";
    require(true, "Oracle call was successful");

    playerInfo[msg.sender].balance-=pendingGames[pendingGameId].amount;

    //create in progress games under each player address
    inProgressGames[msg.sender] = inProgressGame(pendingGames[pendingGameId].amount, pendingGames[pendingGameId].player1, link1, msg.sender, link2, true);
    inProgressGames[inProgressGames[msg.sender].player1] = inProgressGame(pendingGames[pendingGameId].amount, pendingGames[pendingGameId].player1, link1, msg.sender, link2, true);

    //remove pending game from player 1 and set pending game to not valid (basically erase pending game)
    pendingGames[pendingGameId].isValid = false;
    playerInfo[inProgressGames[msg.sender].player1].hasPendingGame = false;
    playerInfo[inProgressGames[msg.sender].player1].pendingGameId = 0;

    emit InProgressGame(pendingGames[pendingGameId].amount, pendingGames[pendingGameId].player1, link1, msg.sender, link2);
  }

  //endGame
  //Either user can hit button. Game must be over or cancelled. If not, gas will be charged to caller and nothing will happen,
  //if game is quit by one player, api will return player that did not quit as winner
  /**
   * Send rewards to the winner. Contract will call this function internally and deduct gas from winners winnings
   * TODO make
   * I am thinking we have a constant java api call that just indicates weather a game is complete or not and the id. This could have winner info in there as well, but
   * then we also still call the same api in the oracle so it is blockchain verifiable and we verify that the game is complete through oracle.
   * if someone tampered with java code, it would just create additional gas fees for the users, no one would profit
   */
  function endGame(address winnerIn) public payable {
    require(inProgressGames[msg.sender].isValid, "Error, Can only call end game if the game is valid");
    require(inProgressGames[msg.sender].player1==msg.sender || inProgressGames[msg.sender].player2==msg.sender , "Error, Can only call end game if you are a player in the game");
    require(!playerInfo[msg.sender].hasPendingGame, "Error, cannot join game if player has a pending game");

    //Eventually call to oracle to verify game is finished and get winner address
    bool gameFinished = true;
    require(gameFinished,"Error, game must be finished or cancled in order to end game");
    address winner = winnerIn; //inProgressGames[msg.sender].player1; //player 1 always winner for now
    address loser;
    if(inProgressGames[msg.sender].player1 == winnerIn){
      loser = inProgressGames[msg.sender].player2;
    }else{
      loser = inProgressGames[msg.sender].player2;
    }

    require(winner!=loser,"Winner and loser cannot be the same");

    //TODO add in taking tax for versus and game dev
    //playerInfo[loser].balance-=inProgressGames[msg.sender].amount;
    playerInfo[winner].balance+=inProgressGames[msg.sender].amount*(2);

    //remove finished game from map by setting isValid false (basically erase in progress game)
    inProgressGames[inProgressGames[msg.sender].player1].isValid = false;
    inProgressGames[inProgressGames[msg.sender].player2].isValid = false;

    emit Result(inProgressGames[msg.sender].player1, inProgressGames[msg.sender].player2, winner, inProgressGames[msg.sender].amount*2, block.timestamp);
  }

  /**
   * Withdraw Ether from this contract (admin option).
   */
  function withdrawEther(uint256 amount) external payable {
    require(playerInfo[msg.sender].balance>=amount, 'Error, insufficent balance');
    //send funds to individual withdrawing funds
    (bool success,) = payable(msg.sender).call{value: amount}("");
    require(success, "Failed to withdraw currency");
    playerInfo[msg.sender].balance-=amount; //update player balance
    emit Withdraw(msg.sender, amount);
  }
}