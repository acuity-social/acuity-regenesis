let Api = require('@parity/api')
import Web3 from 'web3'
import net from 'net'
import fs from 'fs'

async function start() {
  let provider = new Api.Provider.Http(process.env.HTTP_URL)
  let api = new Api(provider)
  let web3: any

  switch(process.env.WEB3_TYPE) {
    case 'IPC':
      web3 = new Web3(new Web3.providers.IpcProvider(process.env.IPC_PATH!, net))
      break

    case 'HTTP':
      web3 = new Web3(new Web3.providers.HttpProvider(process.env.HTTP_URL!))
      break
  }

  let blockNumber = await web3.eth.getBlockNumber()
  console.log('Block:', blockNumber.toLocaleString())

  let accounts
  let total = 0
  let existential = web3.utils.toBN(web3.utils.toWei('0.001'))
  let claims = []
  let accountsPromise: Promise<String[]> = api.parity.listAccounts(10000, '0x0000000000000000000000000000000000000000', blockNumber)
  do {
    accounts = await accountsPromise
    accountsPromise = api.parity.listAccounts(10000, accounts[accounts.length - 1], blockNumber)

    for (let account of accounts) {
      let balance = web3.utils.toBN(await web3.eth.getBalance(account, blockNumber))
      if (balance.gte(existential)) {
        console.log(account, web3.utils.fromWei(balance))
        claims.push({EthereumAddress: account, BalanceOf: balance.toString()})
        totalBalance.add(balance)
      }
    }

    total += accounts.length
    console.log(claims.length.toLocaleString() + ' / ' + total.toLocaleString())
  }
  while (accounts.length == 10000)

  fs.writeFileSync('claims.json', JSON.stringify(claims))
  process.exit(0)
}

start()
