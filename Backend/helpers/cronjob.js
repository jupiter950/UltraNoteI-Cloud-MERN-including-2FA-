const XUNI = require('ultranotei-api');
const xuni = new XUNI('http://localhost', '6070');
const User = require('../models/user');
const Wallet = require('../models/wallet');
const Transaction = require('../models/transactions');
const mongoose = require("mongoose");


const db = 'mongodb+srv://test:test1234@test.iocw1.mongodb.net/UltraNote?retryWrites=true&w=majority'

async function main() {
    await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        console.log('DATABASE CONNECTED')
    }).catch((error) => {
        console.log("ERROR OUCCURED", error);
    });


    try {

        let senderId = '';
        let wallets = await Wallet.find({});
        let walletsList = []
        for (let i = 0; i < wallets.length; i++) {
            let wallet = wallets[i]
            walletsList.push(wallet.address)
        }

        console.log(walletsList);
        const unconfirmedTransactionHashes = await xuni.getUnconfirmedTransactionHashes(walletsList);
        console.log(unconfirmedTransactionHashes);

        for (let i = 0; i < unconfirmedTransactionHashes.transactionHashes.length; i++) {
            const getTransaction = await xuni.getTransaction(unconfirmedTransactionHashes.transactionHashes[i]);
            console.log(getTransaction);


            for (let i = 0; i < getTransaction.transaction.transfers.length; i++) {
                console.log("Transfers", getTransaction.transaction.transfers[i]);
            }

            const indexOfRecipientAddress = walletsList.indexOf(getTransaction.transaction.transfers[0].address);

            const senderAddress = getTransaction.transaction.transfers[1].address;

            if (walletsList.indexOf(senderAddress) === -1) {

                const user = await User.find({ firstName: 'ExternalUser' });

                if (user.length > 0) {
                    senderId = user._id;

                } else {
                    const new_user = {
                        firstName: 'ExternalUser',
                        lastName: 'ExternalUser',
                        mail: 'ExternalUser@gmail.com',
                        password: 'passwordHash',
                    }

                    await User.create(new_user)
                    const user = await User.find({ firstName: 'ExternalUser' });
                    senderId = user._id;
                }

            } else {
                const senderWallet = await Wallet.find({ address: senderAddress });
                senderId = senderWallet.walletHolder;
            }

            console.log(getTransaction.transaction.transactionHash)
            const transaction = await Transaction.find({ hash: getTransaction.transaction.transactionHash });

            if (transaction.length > 0) {
                console.log('Transation Exist')

            } else {
                const newTransaction = {
                    senderID: senderId,
                    senderAdress: senderAddress,
                    recipientAdress: walletsList[indexOfRecipientAddress],
                    amount: getTransaction.transaction.transfers[0].amount,
                    note: 'Transfer From Other Platform',
                    hash: getTransaction.transaction.transactionHash
                }
                try{
                    await Transaction.create(newTransaction);
                    console.log('New Transation Created')
                }
                catch(ex){
                    console.log(ex);
                }

            }
        }

    } catch (error) {
        console.log(error);
    }
    process.exit(0)
}

main();