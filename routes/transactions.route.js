const router = require("express")()

router.post("/new-transaction", (req,res)=> {
    return res.send("transactions route")
})

module.exports = router