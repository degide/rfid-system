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

const createCard = async (newCard) => {
    const validationResult = cardValidator(newCard)
    if(validationResult.error) {
        return {
            success: false,
            message: "Invalid card details",
            err: validationResult.error.details[0].message.replace(/"/g, "")
        }
    }
    let sameCardDetails = await getCardByUUID(newCard.cardUUID)
    if(!sameCardDetails.success) {
        return {
            success: false,
            message: cardDetails.message
        }
    }
    if(sameCardDetails.rows.length > 0){
        return {
            success: false,
            message: "CARD ALREADY REGISTERED"
        }
    }
    const data = [newCard.cardUUID, newCard.cardBalance, newCard.customerFirstName, newCard.customerLastName];
    return dbConnection.promise().query("INSERT INTO CARDS(cardUUID,cardBalance,customerFristName,customerLastName) VALUES(?,?,?,?)", data).then((results)=> {
        return {
            success: true,
            message: "Card Registered",
            data: {
                cardId: results[0].insertId,
                ...newCard
            }
        }
    }).catch((err)=> {
        return {
            success: false,
            message: "Invalid card details",
            err: err.message
        };
    })
}

const getCardById = (cardId) => {

}

const getCardByUUID = (cardUUID) => {
    return dbConnection.promise().query("SELECT * FROM CARDS WHERE cardUUID=?", cardUUID).then((results)=> {
        return {
            success: true,
            message: "Data returned",
            rows: results[0],
            columns: [...results[1].map(col=> col.name)]
        }
    }).catch((err)=> {
        return {
            success: false,
            message: "SOMETHING WENT WRONG",
            err: err.message
        };
    })
}

const getAllCards = async() => {
    return dbConnection.promise().query("SELECT * FROM CARDS").then(results=> ({
        success: true,
        message: "Data returned",
        rows: results[0],
        columns: [...results[1].map(col=> col.name)]
    })).catch(err=> ({
        success: false,
        message: "SOMETHING WENT WRONG",
        err: err.message
    }))
}

const cardTopUp = async(cardUUID, amount) => {
    let validation = Joi.object({
        cardUUID: Joi.string().min(3).required(), amount: Joi.number().min(0).required()
    }).validate({cardUUID: cardUUID, amount: amount})
    if(
        validation.error
    ){
        return {
            success: false,
            message: "Invalid details",
            err: validation.error.details[0].message.replace(/"/g, "")
        }
    }
    const cardDetails = await getCardByUUID(cardUUID)
    if(!cardDetails.success) {
        return {
            success: false,
            message: cardDetails.message
        }
    }
    if(cardDetails.rows.length < 1){
        return {
            success: false,
            message: "CARD NOT FOUND"
        }
    }

    let updateData = [(cardDetails.rows[0].cardBalance+amount), cardDetails.rows[0].cardUUID]
    return dbConnection.promise().query("UPDATE CARDS SET cardBalance=? WHERE cardUUID=?", updateData).then((results)=> {
            return {
                success: true,
                message: "Balance updated",
                new_amount: (cardDetails.rows[0].cardBalance+amount)
            }
        }).catch((err)=> {
            return {
                success: false,
                message: "SOMETHING WENT WRONG",
                err: err.message
            };
        })

}

const deleteCardByUUID = async (cardUUID) => {
    let validation = Joi.string().min(4).required().validate(cardUUID)
    if(validation.error) {
        return {
            success: false,
            message: "Invalid details",
            err: validation.error.details[0].message.replace(/"/g, "")
        }
    }
    let cardDetails = await getCardByUUID(cardUUID)
    if(!cardDetails.success) {
        return {
            success: false,
            message: cardDetails.message
        }
    }
    if(cardDetails.rows.length < 1){
        return {
            success: false,
            message: "CARD NOT FOUND"
        }
    }
    return dbConnection.promise().query("DELETE FROM CARDS WHERE cardUUID=?", cardUUID).then(async(results)=> {
        let deleteResults = {
            deletedCards: results[0].affectedRows,
            deletedTransactions: null
        }
        await dbConnection.promise().query("DELETE FROM TRANSACTIONS WHERE cardUUID=?", cardUUID).then(results=> {
            deleteResults.deletedTransactions = results[0].affectedRows
        }).catch(err=> console.log(`[${new Date()}] Failed to delete transactions`))
        return {
            success: true,
            message: "CARD DELETED ALONG WITH ITS TRANSACTIONS!",
            affectedData: deleteResults 
        }
    }).catch((err)=> {
        return {
            success: false,
            message: "SOMETHING WENT WRONG",
            err: err.message
        };
    })
}

module.exports = {
    createCard,
    getCardById,
    getCardByUUID,
    getAllCards,
    deleteCardByUUID,
    cardTopUp
}