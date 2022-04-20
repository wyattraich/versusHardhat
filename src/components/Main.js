import React, { Component } from 'react';
import eth from '../logos/eth.png';
import './App.css';

class Main extends Component {

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
                    <div className="input-group mb-4">
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-md"
                        placeholder="Game Wager Amount..."
                        onChange={(e) => this.props.onChange(e.target.value)}
                        required
                      />
                      <div className="input-group-append">
                        <div className="input-group-text">
                          <img src={eth} height="20" alt=""/>&nbsp;<b>ETH</b>
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-success btn-lg"
                      onClick={(event) => {
                        event.preventDefault()
                        //start with digit, digit+dot* or single dot*, end with digit.
                        var reg = new RegExp("^[0-9]*.?[0-9]+$")    

                        if(reg.test(this.props.amount)){
                          const amount = (this.props.amount).toString()
                          this.props.makeGame(this.props.web3.utils.toWei(amount))
                        } else {
                          window.alert('Please type positive interger or float numbers')
                        }
                      }}>
                        Create Game
                    </button>
                    &nbsp;&nbsp;&nbsp;

                    <button
                      type="submit"
                      className="btn btn-success btn-lg"
                      onClick={(event) => {
                        event.preventDefault()
                          this.props.getPendingGames()
                      }}>
                        Refresh Games
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
                          <th scope="col"> Join </th>
                        </tr>
                      </thead>
                      <tbody id="pendingGames">
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

export default Main;