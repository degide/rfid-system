const router = require("express").Router()
const { createTransaction, getAllTransactions, getTransactionsByCardUUID, deleteTransaction } = require("../controllers/transactions.controller")

router.post("/new-transaction", async(req,res)=> {
    const transactionResults = await createTransaction(req.body, req.app.get("IO"))
    return res.send(transactionResults)
})

router.get("/all-transactions", async(req,res)=> {
    let Results = await getAllTransactions()
    return res.send(Results)
})

router.get("/transactions-by-uuid/:card_uuid", async(req,res)=> {
    let Results = await getTransactionsByCardUUID(req.params.card_uuid);
    return res.send(Results)
})

router.delete("/delete-transaction-by-id/:transaction_id", async(req,res)=> {
    let Results = await deleteTransaction(req.params.transaction_id)
    return res.send(Results)
})

module.exports = router