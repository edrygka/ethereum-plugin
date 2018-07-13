
const network_url = "https://ropsten.infura.io"
const gas_price_url = "https://ethgasstation.info/json/ethgasAPI.json"
var web3 = new Web3(new Web3.providers.HttpProvider(network_url))

function getCurrentGasPrices() {
    fetch(gas_price_url).then(response => {
        return response.text()
    }).then(data => {
        data = JSON.parse(data)
        document.getElementById("low-price").innerText = data.safeLow / 10 + " (transaction completes in < 30 minutes)"
        document.getElementById("medium-price").innerText = data.average / 10 + " (transaction completes in < 5 minutes)"
        document.getElementById("high-price").innerText = data.fast / 10 + " (transaction completes in < 2 minutes)"
        setTimeout(getCurrentGasPrices, 5000)
    })
}
getCurrentGasPrices()

async function getBalance(){
    const addr = document.getElementById("address").value
    const balanse_info = await web3.eth.getBalance(addr)
    document.getElementById("balance").innerText = balanse_info/1000000000000000000 + " ethers"
}

async function sendTransaction(){
    const sender = document.getElementById("sender").value
    const privKey = document.getElementById("privKey").value
    const to = document.getElementById("to").value
    const amount = document.getElementById("amount").value
    const fee = document.getElementById("gasprice").value
    const nonce = await web3.eth.getTransactionCount(sender)
    let details = {
        "to": to,
        "value": (amount * 1000000000).toString(16),
        "gas": 21000,
        "gasPrice": fee * 1000000000, // converts the gwei price to wei(*10^9)
        "nonce": nonce,
        "chainId": 3 // EIP 155 chainId - mainnet: 1, rinkeby: 4, ropsten: 3, morden: 2
    }
    const transaction = new EthJS.Tx(details)
    transaction.sign(ethereumjs.Buffer.Buffer.from(privKey, 'hex'))
    const serializedTransaction = transaction.serialize()
    const transactionId = await web3.eth.sendRawTransaction('0x' + serializedTransaction.toString('hex'))
    const url = `https://ropsten.etherscan.io/tx/${JSON.stringify(transactionId)}`
}
