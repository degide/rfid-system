const { dbConnection } = require("../database/index")

async function getHomeStats(){
    let stats = {
        numberOfTransactions: 0,
        numberOfCards: 0,
        latestTransactionsRows: [],
        latestTransactionsCols: []
    }
    return dbConnection.promise().query("SELECT COUNT(transactionId) AS numberOfTransactions FROM TRANSACTIONS").then(async res=> {
        stats.numberOfTransactions = res[0][0].numberOfTransactions;
        return dbConnection.promise().query("SELECT COUNT(cardId) AS numberOfCards FROM CARDS").then(async result=> {
            stats.numberOfCards = result[0][0].numberOfCards;
            return dbConnection.promise().query("SELECT * FROM TRANSACTIONS ORDER BY transactionId DESC LIMIT 7").then(results=> {
                stats.latestTransactionsRows = results[0]
                stats.latestTransactionsCols = [...results[1].map(col=> col.name)]
                return {
                    success: true,
                    message: "GOT STATS",
                    ...stats
                }
            })
        })
    }).catch(err=> ({
        success: false,
        message: err.message
    }))
}

module.exports = {
    getHomeStats
}