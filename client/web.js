
const network_url = "https://ropsten.infura.io"
const gas_price_url = "https://ethgasstation.info/json/ethgasAPI.json"
//var web3 = new Web3(new Web3.providers.HttpProvider(network_url))

function getCurrentGasPrices() {
    fetch(gas_price_url).then(response => {
        return response.text()
    }).then(data => {
        data = JSON.parse(data)
        document.getElementById("low-price").innerText = data.safeLow / 10 + " (transaction completes in < 30 minutes)"
        document.getElementById("medium-price").innerText = data.average / 10 + " (transaction completes in < 5 minutes)"
        document.getElementById("high-price").innerText = data.fast / 10 + " (transaction completes in < 2 minutes)"
        setTimeout(getCurrentGasPrices, 50000)
    })
}
getCurrentGasPrices()

async function getBalance(){
    var web3 = new Web3(new Web3.providers.HttpProvider(network_url))
    const addr = document.getElementById("address").value
    const balanse_info = await web3.eth.getBalance(addr)
    document.getElementById("balance").innerText = balanse_info/1000000000000000000 + " ethers"
}

async function sendTransaction(){
    const sender = document.getElementById("sender").value
    const privKey = document.getElementById("privKey").value
    const to = document.getElementById("to").value
    const amount = document.getElementById("amount").value
    //const fee = document.getElementById("gasprice").value
    let data = {from: sender, privKey: privKey, reciver: to, amount: amount}
    data = Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&')
    fetch('http://localhost:3000/sendTransaction', {mode: "no-cors",method: "POST",headers: {
        'Content-Type':'application/x-www-form-urlencoded'
      }, body: data}).then(response => {
          response.text().then(data => console.log(data))
      })
    //const url = `https://ropsten.etherscan.io/tx/${content}`
}
