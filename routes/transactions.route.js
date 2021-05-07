const router = require("express").Router()
const { createTransaction } = require("../controllers/transactions.controller")

router.post("/new-transaction", async(req,res)=> {
    const transactionResults = await createTransaction(req.body, req.app.get("IO"))
    return res.send(transactionResults)
})

module.exports = router