let Api = require('@parity/api')

async function start() {
  let provider = new Api.Provider.Http(process.env.MIX_RPC_URL)
  let api = new Api(provider)

  let blockNumber = await api.eth.blockNumber()
  console.log('Block:', blockNumber.toLocaleString())

  let accounts
  let start = '0x0000000000000000000000000000000000000000'
  let total = 0
  do {
    accounts = await api.parity.listAccounts(10000, start, blockNumber)
    total += accounts.length
    console.log(total.toLocaleString())

    for (let account of accounts) {
      await api.eth.getBalance(account, blockNumber)
        .then((balance: number) => {
          if (balance != 0) {
            console.log(account, balance)
          }
        })
    }

    start = accounts[accounts.length - 1]
  }
  while (accounts.length == 10000)
}

start()
