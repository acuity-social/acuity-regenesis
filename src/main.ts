let Api = require('@parity/api')
import Web3 from 'web3'
import net from 'net'
import fs from 'fs'

async function start() {
  let provider = new Api.Provider.Ws(process.env.WS_URL)
  let api = new Api(provider)
  let web3: any = new Web3(new Web3.providers.IpcProvider(process.env.IPC_PATH!, net))

  let blockNumber = await web3.eth.getBlockNumber()
  console.log('Block:', blockNumber.toLocaleString())

  let querySize = 100000
  let accounts
  let total = 0
  let totalBalance = web3.utils.toBN(0)
  let existential = web3.utils.toBN(web3.utils.toWei('0.001'))
  let claims: any[] = []
  let accountsPromise: Promise<String[]> = api.parity.listAccounts(querySize, null, blockNumber)
  do {
    accounts = await accountsPromise
    accountsPromise = api.parity.listAccounts(querySize, accounts[accounts.length - 1], blockNumber)

    for (let account of accounts) {
      let balance = web3.utils.toBN(await web3.eth.getBalance(account, blockNumber))
      if (balance.gte(existential)) {
        console.log(account, web3.utils.fromWei(balance))
        claims.push({EthereumAddress: account, BalanceOf: balance.toString()})
        totalBalance = totalBalance.add(balance)
      }
    }

    total += accounts.length
    console.log(claims.length.toLocaleString() + ' / ' + total.toLocaleString())
  }
  while (accounts.length == querySize)

  console.log('Total ACU: ', web3.utils.fromWei(totalBalance))
  fs.writeFileSync('claims.json', JSON.stringify(claims))
  console.log('claims.json written.')
  process.exit(0)
}

start()
