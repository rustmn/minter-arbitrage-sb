export default {
  minter_explorer_api_url: 'https://explorer-api.minter.network/api/v2',
  minter_gate_api_url: 'https://gate-api.minter.network/api/v2',
  minter_node_api_url: 'https://node-api.minter.network/v2',
  db: {
    connection_string: 'mongodb+srv://<username>:<password>@lolkekcheburek.unwx3.mongodb.net/<name>?retryWrites=true&w=majority',
    user: process.env.DB_USER as string,
    pass: process.env.DB_PASS as string,
    name: 'minter-arb'
  },
  chainId: 1
};