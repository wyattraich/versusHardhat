import React, { Component } from 'react';
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
                    <p> link: www.poop.com
                    </p>

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