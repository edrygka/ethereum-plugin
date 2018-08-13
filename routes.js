const Web3 = require('web3')
const EthereumTx = require('ethereumjs-tx')
const axios = require('axios')
const logger = require('./logger')
const config = require('./config/config.js')

const web3 = new Web3(new Web3.providers.HttpProvider(config.urlProvider))


module.exports = app => {
    app.post('/sendTransaction', (req, res, next) => {
        const privKey = String(req.body.privKey)
        const reciver = String(req.body.reciver)
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
            })
            // TODO: Error handler 
            .on('error', error => {
                next(error.message)
            })
        } catch(e){
            next(e.message)
        }
    }, (err, req, res) => {
        logger.error(e.message)
        res.send({code: 1, data: err})
    })


    app.get('/getBalance', (req, res, next) => {
        const address = req.query["address"]
        web3.eth.getBalance(address, null, (err, result) => {
            if(err) {
                logger.error(e.message)
                return next(err)
            } 
            const balance = result/1000000000000000000
            logger.info('Get balance operation successfuly performed, balance = ' + balance + ' ethers')
            return res.send({code: 0, data: balance})
        })
    }, (err, req, res) => {
        res.send({code: 1, data: e.message})
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
  