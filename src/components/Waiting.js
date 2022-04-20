import React, { Component } from 'react';
import './App.css';

class Waiting extends Component {

  render() {
    return (
      <div className="container-fluid mt-5 col-m-4" style={{ maxWidth: '550px' }}>
        <div className="col-sm">
          <main role="main" className="col-lg-12 text-monospace text-center text-white">
            <div className="content mr-auto ml-auto">
              <div id="content" className="mt-3" >
                <div className="card mb-4 bg-dark border-danger">
                  <div className="card-body">
                    &nbsp;
                    <p></p>
                    <div>
                      <h2>
                        Waiting for other player to join game with wager of
                      </h2>
                      <div className="float" style={{ height: '25px' }}>
                          {Number(this.props.web3.utils.fromWei((this.props.pendingGameAmount).toString())).toFixed(5)} <b>ETH&nbsp;</b>
                      </div>
                      <br></br>
                      <div id="loader" className="spinner-border text-light" role="status"></div>
                    </div>
                    <br></br>
                    <button
                      type="submit"
                      className="btn btn-success btn-lg"
                      onClick={(event) => {
                        event.preventDefault()
                          this.props.getPendingGames()
                      }}>
                        Refresh Open Games
                    </button>
                    &nbsp;&nbsp;&nbsp;

                  </div>
                  <div>
                    {!this.props.balance ? <div id="loader" className="spinner-border float-right" role="status"></div> :
                      <div className="float-right" style={{ width: '220px' }}>
                        <div className="float-left" style={{ height: '17px' }}>
                          <b>MaxBet&nbsp;</b>
                        </div>
                        <div className="float-right" style={{ height: '17px' }}>
                          {Number(this.props.web3.utils.fromWei((this.props.playerBalance).toString())).toFixed(5)} <b>ETH&nbsp;</b>
                        </div>
                        <br></br>
                        <div className="float-left">
                          <b>Balance&nbsp;</b>
                        </div>
                        <div className="float-right">
                        {Number(this.props.web3.utils.fromWei((this.props.balance).toString())).toFixed(5)} <b>ETH&nbsp;</b>
                        </div>
                      </div>
                    }
                  </div>
                </div>
                  <div className="card mb-4 bg-dark border-danger">
                    <div className="card-body">
                    <table>
                      <thead>
                        <tr>
                          <th scope="col">id</th>
                          <th scope="col">Player</th>
                          <th scope="col">Amount</th>
                        </tr>
                      </thead>
                      <tbody id="pendingGamesNoJoin">
                      </tbody>
                    </table>
                    </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Waiting;