# ethereum-plugin

To run this app:
 1) Intall it from github by "git clone https://github.com/edrygka/ethereum-plugin"
 2) Install all libraries "npm install"
 3) Run it "npm start"

To change port or other urls, go to config folder and change config.js file

1) getBalance
    send get request to "http://127.0.0.1:3000/getBalance?address=your_address" 

2) sendTransaction
    to execute transaction send post request to "http://127.0.0.1:3000/sendTransaction" with body params from, privKey, to, amount. Exactly it looks like {from: address ethers will left, privKey: private key from address, to: address that will recieve thers, amount: value of coins in ethers}

3) createKeys
    to get key pair send get request to "http://127.0.0.1:3000/createKeys" will return you object contains address and private key
