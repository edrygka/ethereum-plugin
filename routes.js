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
    app.post('/sendTransaction', async (req, res, next) => {
        const sender = req.body.from
        const privKey = req.body.privKey
        const reciver = req.body.reciver
        const amount = req.body.amount

        //const gasPrice = req.body.gasPrice
        //getCurrentGasPrices().then(res => console.log(res)).catch(err => console.log(err.message))
        try{
            const gasPrices = await getCurrentGasPrices()
            const nonce = await web3.eth.getTransactionCount(sender)

            const details = {
                "to": reciver,
                "value": web3.utils.toHex(web3.utils.toWei(amount, 'ether') ),
                "gas": 21000,
                "gasPrice": gasPrices.low * 1000000000, // converts the gwei price to wei(*10^9)
                "nonce": nonce,
                "chainId": 3 // EIP 155 chainId - mainnet: 1, rinkeby: 4, ropsten: 3, morden: 2
            }

            const transaction = new EthereumTx(details)

            transaction.sign(Buffer.from(privKey, 'hex'))
  
            const serializedTransaction = transaction.serialize()

            web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'), (err, result) => {
                if(err) throw err
                logger.info('Transaction successfuly performed ' + result)
                res.send({code: 0, data: result})
            })

        } catch(e){
            logger.error(e.message)
            res.send({code: 1, data: e.message})
        }
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
  
