const Web3 = require('web3')
const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()
//const web3 = new Web3('http://localhost:9545');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.infuraNode));

const app = express()
app.use(bodyParser.json())

async function initialization() {
    const MyContract = require('./build/contracts/Consentement.json')
    const id = await web3.eth.net.getId();
    return new web3.eth.Contract(MyContract.abi, process.env.contractAddress);
}

const contract = initialization();

app.get('', async (req, res) => {
    console.log("je suis rentré dans le GET")
    try {
        const result = await contract
        const value = await result.methods.getUserInfo(req.query.idPerson).call();
        if (value[0] != "") {
            res.send(value)
        } else {
            res.send("Cette personne n'existe pas sur la Blockchain ")
        }
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
        const myCompte =(await web3.eth.getAccounts())[0]
        await result.methods.SetUserInfo(idPerson, nom, prenom, mailAdresse, answer).send({from: myCompte, gas:900000});
        res.send(`L'utilisateur (id = ${idPerson}, nom = ${nom}, prenom = ${prenom}, mail = ${mailAdresse}, consentement = ${answer}) a été ajouté avec succés`)
    } catch (e) {
        console.log(e)
        res.send(e)
    }
})

app.listen(process.env.port, () => {
    console.log(`App listening on port ${process.env.port} \n`)
})