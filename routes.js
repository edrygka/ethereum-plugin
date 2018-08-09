const Web3 = require('web3')
const EthereumTx = require('ethereumjs-tx')
const axios = require('axios')
const logger = require('./logger')
const config = require('./config/config.js')

const web3 = new Web3(new Web3.providers.HttpProvider(config.urlProvider))

const getCurrentGasPrices = () => {
    return new Promise((res, rej) => {
        axios.get(config.urlGasPrice).then(response => {
            const prices = {
                low: response.data.safeLow / 10,
                medium: response.data.average / 10,
                high: response.data.fast / 10
            }
            logger.info('Successfuly get gas price')
            res(prices)
        }).catch(err => rej(err))
    })
}

module.exports = app => {
    app.post('/sendTransaction', (req, res, next) => {
        const privKey = req.body.privKey
        const reciver = req.body.reciver
        const amount = Number(req.body.amount)
        const gasprice = Number(req.body.gasprice)
        const nonce = Number(req.body.nonce)

        const details = {
            "to": reciver,
            "value": amount * 10e17,
            "gas": 21000,
            "gasPrice": gasprice * 10e9, // converts the gwei price to wei(*10^9)
            "nonce": nonce,
            "chainId": 3 // EIP 155 chainId - mainnet: 1, rinkeby: 4, ropsten: 3, morden: 2
        }
        
        try {
            const transaction = new EthereumTx(details)
            transaction.sign(Buffer.from(privKey, 'hex'))
            const serializedTransaction = transaction.serialize()
            web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'))
            .on('transactionHash', result => {
                logger.info('Transaction successfuly performed ' + result)
                res.send({code: 0, data: result})
            })
            .on('confirmation', result => {
                logger.info('Transaction has already ' + result + ' confirmations')
                // if(result == 5){
                //     res.send({code: 0, data: "Transaction has already " + result + " confirmations"})
                // }
            })
            // TODO: Error handler 
            .on('error', error => {
                next(error)
            })
        } catch(e){
            logger.error(e.message)
            next(e)
        }
        
    })

    app.post('/sendTransaction', (err, req, res) => { 
        console.log("Hello ======================== " + err)
        res.send({code: 1, data: err.message})
    })

    app.get('/getBalance', (req, res) => {
        const address = req.query["address"]
        try{
            web3.eth.getBalance(address, null, (err, result) => {
                if(err) throw err
                logger.info('Get balance operation successfuly performed')
                res.send({code: 0, data: result/1000000000000000000})
            })
        } catch(e){
            logger.error(e.message)
            res.send({code: 1, data: e.message})
        }
    })

    app.get('/createKeys', (req, res) => {
        let keys
        try{
            keys = web3.eth.accounts.create()
            logger.info('Keys successfuly created ' + JSON.stringify(keys))
        } catch(e){
            logger.error(e.message)
            res.send({code: 1, data: e.message})
        }
        res.send({code: 0, data: keys})
    })

    app.get('/wallet', (req, res) => {
        res.sendFile('client/wallet.html', {root: __dirname })
    })
}
  