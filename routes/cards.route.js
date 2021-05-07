const router = require("express").Router()
const { createCard } = require("../controllers/cards.controller")

router.post("/new-card", (req,res)=> {
    const result = createCard(req.body);
    console.log(result);
    return res.send(result)
})

module.exports = router