export default {
  minter_explorer_api_url: 'https://explorer-api.testnet.minter.network/api/v2',
  minter_gate_api_url: 'https://gate-api.testnet.minter.network/api/v2',
  minter_node_api_url: 'https://node-api.testnet.minter.network/v2',
  db: {
    connection_string: 'mongodb+srv://<username>:<password>@lolkekcheburek.unwx3.mongodb.net/<name>?retryWrites=true&w=majority',
    user: process.env.DB_USER_DEV as string,
    pass: process.env.DB_PASS_DEV as string,
    name: 'minter-arb-dev'
  },
  chainId: 2,
  minter_bip_price_url: 'https://api.coingecko.com/api/v3/coins/bip'
};