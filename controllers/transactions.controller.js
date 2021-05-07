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
    let TRANSACTION = [newTransactionData.cardUUID,newTransactionData.initialBalance, newTransactionData.transportFare, newTransactionData.newBalance, newTransactionData.transactionDate];
    return await dbConnection.promise().query(updateCardSql, [newTransactionData.newBalance, newTransactionData.cardUUID]).then(async results=> {
        if(results[0].affectedRows > 0) {
            return await dbConnection.promise().query(newTransactionSql, TRANSACTION).then(res=> {
                //emit the new transaction in socket io
                io.emit("NEW_TRANSACTION", {
                    success: true,
                    message: "TRANSACTION SUCCESS"+((res[0].affectedRows > 0)? "":" BUT FAILED TO RECORD IT"),
                    transaction: {
                        transactionId: res[0].insertId,
                        ...newTransactionData
                    }
                })
                if(res[0].affectedRows > 0) {
                    return {
                        success: true,
                        message: "TRANSACTION SUCCESS",
                        transaction: {
                            transactionId: res[0].insertId,
                            ...newTransactionData
                        }
                    }
                }else {
                    return {
                        success: true,
                        message: "Warning: TRANSACTION SUCCESS BUT FAILED TO RECORD IT",
                        transaction: {
                            transactionId: res[0].insertId,
                            ...newTransactionData
                        }
                    }
                }
            }).catch(err=> {
                return {
                    success: true,
                    message: "Warning: TRANSACTION SUCCESS BUT FAILED TO RECORD IT",
                    err: err.message
                }
            })
        }else{
            return {
                success: false,
                message: "TRANSACTION FAILED",
                err: ""
            }
        }
    }).catch(err=> {
        return {
            success: false,
            message: "TRANSACTION FAILED",
            err: err.message
        }
    })
}

const getTransactionById = (transactionId) => {

}

const getTransactionsByCardUUID = async(cardUUID) => {
    let schema = Joi.object({
        cardUUID: Joi.string().min(3).max(50).required()
    })
    if(schema.validate({cardUUID: cardUUID}).error){
        return {
            success: false,
            message: "Invalid Card UUID",
            err: schema.validate({cardUUID: cardUUID}).error.details[0].message.replace(/"/g, "")
        }
    }
    return dbConnection.promise().query("SELECT * FROM TRANSACTIONS WHERE cardUUID=?", cardUUID).then(results=> ({
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

const getAllTransactions = async() => {
    return await dbConnection.promise().query("SELECT * FROM TRANSACTIONS").then(results=> ({
        success: true,
        message: "Data returned",
        rows: results[0],
        columns: [...results[1].map(col=> col.name)]
    })).catch(err=> {
        return {
            success: false,
            message: "SOMETHING WENT WRONG",
            err: err.message
        }
    })
}

const deleteTransaction = async(transactionId)=> {
    let validator = (transactionId)=> Joi.object({transactionId: Joi.number().min(1).required()}).validate({transactionId: transactionId})
    if(validator(transactionId).error){
        return {
            success: false,
            message: "Invalid Transaction ID",
            err: validator(transactionId).error.details[0].message.replace(/"/g, "")
        }
    }
    return dbConnection.promise().query("DELETE FROM TRANSACTIONS WHERE transactionId=?", transactionId).then(results=> ({
        success: true,
        message: "TRANSACTION DELETED",
        deletedRows: results[0].affectedRows
    })).catch(err=> ({
        success: false,
        message: "SOMETHING WENT WRONG",
        err: err.message
    }))
}

module.exports = {
    createTransaction,
    getTransactionById,
    getTransactionsByCardUUID,
    getAllTransactions,
    deleteTransaction
}