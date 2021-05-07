const { dbConnection } = require("../database/index")
const Joi = require("joi")

function cardValidator(cardObject) {
    const schema = Joi.object({
        cardUUID: Joi.string().min(3).max(50).required(),
        cardBalance: Joi.number().min(0).required(),
        customerFirstName: Joi.string().min(3).max(40).required(),
        customerLastName: Joi.string().min(3).max(40).required()
    })
    return schema.validate(cardObject)
}

const createCard = (newCard) => {
    const validationResult = cardValidator(newCard)
    if(validationResult.error) {
        return {
            success: false,
            message: "Invalid card details"
        }
    }
    dbConnection.query("INSERT INTO CARDS(cardUUID,cardBalance,customerFristName,customerLastName) VALUES(?,?,?,?)", [newCard.cardUUID, newCard.cardBalance, newCard.customerFirstName, newCard.customerLastName], (err, results)=> {
        if(err){
            console.log(`[${new Date()}] MYSQL_ERROR: ${err.message}`)
            return {
                success: false,
                message: "Invalid card details"
            };
        }else return {
            success: true,
            message: "Card Registered",
            data: {
                cardId: results.insertId,
                ...newCard
            }
        }
    })
}

const getCardById = (cardId) => {

}

const getCardByUUID = (cardUUID) => {

}

const getAllCards = () => {

}

const cardTopUp = (cardUUID, amount) => {

}

const deleteCard = (cardId) => {

}

module.exports = {
    createCard,
    getCardById,
    getCardByUUID,
    getAllCards,
    deleteCard
}