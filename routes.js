const Web3 = require('web3')
const EthereumTx = require('ethereumjs-tx')
const axios = require('axios')

const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io'))

const getCurrentGasPrices = async () => {
    let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
    let prices = {
      low: response.data.safeLow / 10,
      medium: response.data.average / 10,
      high: response.data.fast / 10
    }
    return prices
}

module.exports = app => {
    app.post('/sendTransaction', async (req, res) => {

        const sender = req.body.from
        const privKey = req.body.privKey
        const reciver = req.body.to
        const amount = req.body.amount

        //const gasPrice = req.body.gasPrice
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
            if(err) res.send({status: 404, data: err})
            res.send({status: 200, data: result})
        })
    })

    app.post('/getBalance', (req, res) => {

        const address = req.body.address
        try{
            web3.eth.getBalance(address, null, (err, result) => {
                if(err) throw err
                res.send({status: 200, data: result/1000000000000000000})
            })
        } catch(e){
            console.log(e.message)
            res.send({status: 404, data: e.message})
        }
    })
}
  
//   const addr = "0x142BC8c8996dc2D2b579fAb4522CEf0928DB35cE"
//   const privKey = "0cf6da84e1b3219775dab09b5751b28478afad15fabdb7ab7495abd81c4f06f6"
//   const recipient = "0xb1ecd2b698565f2efbea025f64f388fa30402e1d"
  
