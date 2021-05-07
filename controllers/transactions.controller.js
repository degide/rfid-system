const { dbConnection } = require("../database/index")
const Joi = require("joi")

function transactionValidator(transation) {
    const schema = Joi.object({
        cardUUID: Joi.string().min(3).max(50).required(),
        initialBalance: Joi.number().min(0).required(),
        transportFare: Joi.number().min(0).required(),
        newBalance: Joi.number().min(0).required(),
        transactionDate: Joi.date().required()
    })
    return schema.validate(transation)
}

const createTransaction = (newTransaction) => {

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