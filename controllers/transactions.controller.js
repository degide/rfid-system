const { dbConnection } = require("../database/index")
const Joi = require("joi")
const { getCardByUUID } = require("./cards.controller")

function transactionValidator(transation) {
    const schema = Joi.object({
        cardUUID: Joi.string().min(3).max(50).required(),
        initialBalance: Joi.number().min(transation.transportFare).required(),
        transportFare: Joi.number().min(0).required(),
        newBalance: Joi.number().min(0).required(),
        transactionDate: Joi.date().required()
    })
    return schema.validate(transation)
}

function validateTransactionReqBody(body) {
    const schema = Joi.object({
        cardUUID: Joi.string().min(3).max(50).required(),
        transportFare: Joi.number().min(0).required()
    })
    return schema.validate(body)
}

const createTransaction = async (transactionData, io) => {
    const reqValidation = validateTransactionReqBody(transactionData)
    if(reqValidation.error){
        return {
            success: false,
            message: "Invalid transaction details",
            err: reqValidation.error.details[0].message.replace(/"/g, "")
        }
    }
    let cardDetails = await getCardByUUID(transactionData.cardUUID)
    if(!cardDetails.success) {
        return {
            success: false,
            message: cardDetails.message
        }
    }
    if(cardDetails.rows.length < 1){
        return {
            success: false,
            message: "CARD NOT REGISTERED"
        }
    }
    
    cardDetails = cardDetails.rows[0]
    if(cardDetails.cardBalance < transactionData.transportFare){
        return {
            success: false,
            message: "INSUFFICIENT BALANCE! Please topup your card."
        }
    }

    const newTransactionData = {
        cardUUID: cardDetails.cardUUID,
        initialBalance: cardDetails.cardBalance,
        transportFare: transactionData.transportFare,
        newBalance: (cardDetails.cardBalance-transactionData.transportFare),
        transactionDate: new Date()
    }

    if(transactionValidator(newTransactionData).error) {
        return {
            success: false,
            message: "Invalid transaction",
            err: transactionValidator(newTransactionData).error.details[0].message.replace(/"/g, "")
        }
    }

    let newTransactionSql = `INSERT INTO TRANSACTIONS(cardUUID,initialBalance,transportFare,newBalance,transactionDate) VALUES(?,?,?,?,?)`;
    let updateCardSql = `UPDATE CARDS SET cardBalance=? WHERE cardUUID=?`;
    console.log(io);
    return {
        a: "g"
    }
}

const getTransactionById = (transactionId) => {

}

const getTransactionsByCardUUID = (cardUUId) => {

}

const getAllTransactions = () => {

}

const deleteTransaction = (transactionId)=> {

}

module.exports = {
    createTransaction,
    getTransactionById,
    getTransactionsByCardUUID,
    getAllTransactions,
    deleteTransaction
}