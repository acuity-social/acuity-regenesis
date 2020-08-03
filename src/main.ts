let Api = require('@parity/api')
import Web3 from 'web3'

async function start() {
  let provider = new Api.Provider.Http(process.env.HTTP_URL)
  let api = new Api(provider)
  let web3: any

  switch(process.env.WEB3_TYPE) {
    case 'HTTP':
      web3 = new Web3(new Web3.providers.HttpProvider(process.env.HTTP_URL!))
      break
  }

  let blockNumber = await web3.eth.getBlockNumber()
  console.log('Block:', blockNumber.toLocaleString())

  let accounts
  let start = '0x0000000000000000000000000000000000000000'
  let total = 0
  do {
    accounts = await api.parity.listAccounts(10000, start, blockNumber)

    for (let account of accounts) {
      let balance = await web3.eth.getBalance(account, blockNumber)
        if (balance != 0) {
          console.log(account, web3.utils.fromWei(balance))
        }
    }

    start = accounts[accounts.length - 1]
    total += accounts.length
    console.log(total.toLocaleString())
  }
  while (accounts.length == 10000)
}

start()
