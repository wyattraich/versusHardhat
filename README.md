# versus

## Dependencies
Vscode (remote containers extension)
docker desktop

## Setup
- clone repo
- open versus folder in vscode
- make sure remote containers extension is running
- click on green bar in bottom left corner of vscode and search/select Remote Containers: reopen in container

## Run
- '''shell npm install ''' to install all node dependencies
- '''shell npm run start ''' to start front end app
- '''shell npx hardhat run scripts/deploy.js ''' to deploy contract to local blockchain

## Test
- '''shell npx hardhat test ''' to test solidity smart contract