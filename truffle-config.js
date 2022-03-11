const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    rinkeby: {
      provider: function () {
        return () => {new HDWalletProvider(
            [process.env.privKey], process.env.rinkebyApi, 0, 1
        )};
      },
      network_id: 4,
      gas: 500000,
      gasPrice: 10000000000,
      from: process.env.WalletAddress
    },
  },
  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },
  compilers: {
    solc: {
      version: "^0.8.0"
    }
  }
};