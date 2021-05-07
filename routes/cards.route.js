const router = require("express").Router()
const { 
    createCard, 
    getCardByUUID, 
    cardTopUp, 
    getAllCards, 
    deleteCardByUUID 
} = require("../controllers/cards.controller")

router.post("/new-card", async (req,res)=> {
    const queryResult = await createCard(req.body);
    return res.send(queryResult)
})

router.put("/top-up", async(req,res)=> {
    let results = await cardTopUp(req.body.cardUUID, req.body.amount)
    return res.send(results)
})

router.get("/card-by-uuid/:card_uuid", async (req,res)=> {
    if(!req.params.card_uuid) {
        return res.send({
            success: false,
            message: "Card UUID required"
        })
    }
    const results = await getCardByUUID(req.params.card_uuid)
    if(results.rows.length<1){
        return res.status(404).send({
            success: false,
            message: "CARD NOT FOUND"
        })
    }
    return res.send(results)
})

router.get("/all-cards", async (req,res)=> {
    let results = await getAllCards()
    return res.send(results)
})

router.delete("/delete-card/:card_uuid", async (req,res)=> {
    let deleteResults = await deleteCardByUUID(req.params.card_uuid)
    return res.send(deleteResults)
})

module.exports = router