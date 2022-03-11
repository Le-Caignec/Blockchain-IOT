const Web3 = require('web3')
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const EthTx = require('ethereumjs-tx').Transaction
const provider = new Web3.providers.WebsocketProvider(process.env.infuraNode)
const web3 = new Web3(provider);
const app = express()
const MyContract = require('./build/contracts/Consentement.json')
const contract = new web3.eth.Contract(MyContract.abi, process.env.contractAddress);
app.use(bodyParser.json())
web3.eth.defaultAccount = process.env.WalletAddress;

function sendSignedTx(transactionObject, cb) {
    let transaction = new EthTx(transactionObject, {chain: 'rinkeby'});
    const privateKey = new Buffer.from(process.env.privKey, "hex");
    transaction.sign(privateKey); // sign a transaction
    const serializedEthTx = transaction.serialize().toString("hex"); // serialize the transaction
    web3.eth.sendSignedTransaction(`0x${serializedEthTx}`, cb);
}

function sendTransaction(exchangeEncodeABI) {
    web3.eth.getTransactionCount(process.env.WalletAddress).then(async (transactionNonce) => {
        const transactionObject = {
            chainId: 4,
            nonce: web3.utils.toHex(transactionNonce),
            gasLimit: web3.utils.toHex(500000),
            gasPrice: web3.utils.toHex(10000000000),
            value: 0,
            to: process.env.contractAddress,
            from: process.env.WalletAddress,
            data: exchangeEncodeABI
        };

        sendSignedTx(transactionObject, (err, resp) => {
            if (err) {
                console.log("An error occurred", err)
            }
            console.log("The txHash is: ", resp)
        });
    });
}

app.get('', async (req, res) => {
    console.log("\n je suis rentré dans le GET")
    try {
        const result = await contract
        const myData = await result.methods.getUserInfo(req.query.idPerson).encodeABI();
        sendTransaction(myData)
        contract.once("Return",{},function(error, event){
            if (event.returnValues.person.Nom != ""){
                res.send(`id = ${req.query.idPerson}, nom = ${event.returnValues.person.Nom}, prenom = ${event.returnValues.person.Prenom}, mail = ${event.returnValues.person.mailAdresse}, consentement = ${event.returnValues.person.answere}`);
            }else{
                res.send("Cet individu n'existe pas dans la base de donnée");
            }
        });
    } catch (e) {
        console.log(e)
        res.send(e)
    }
})

app.post('', async (req, res) => {
    console.log("je suis rentré dans le POST")
    try {
        const { idPerson, nom, prenom, mailAdresse, answer } = req.body
        const result = await contract
        const myData = await result.methods.SetUserInfo(idPerson, nom, prenom, mailAdresse, answer).encodeABI();
        sendTransaction(myData);
        res.send(`L'utilisateur (id = ${idPerson}, nom = ${nom}, prenom = ${prenom}, mail = ${mailAdresse}, consentement = ${answer}) a été ajouté avec succés`)
    } catch (e) {
        console.log(e)
        res.send(e)
    }
})

app.listen(process.env.port, () => {
    console.log(`App listening on port ${process.env.port} \n`)
})
