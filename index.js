const app = require("express")()
const body_parser = require("body-parser")
const cors = require("cors")
const cardsRouter = require('./routes/cards.route')
const transactionsRouter = require('./routes/transactions.route')
const { getHomeStats } = require("./controllers/index.controller")
const EJS = require("ejs")
var moment = require('moment');
const { getAllTransactions } = require("./controllers/transactions.controller")
const { getAllCards } = require("./controllers/cards.controller")
require("./database/index")

var server = require("http").createServer(app)
const io = require("socket.io")(server)

app.use(cors({}));
app.use(require("express").urlencoded({extended: true}));
app.use(require("express").json());

app.set("IO", io);
app.set('view engine', 'ejs');

app.use('/static', require("express").static('static'))

app.use("/api/cards", cardsRouter)
app.use("/api/transactions", transactionsRouter)

app.get("/", async(req,res)=> {
    let stats = await getHomeStats()
    if(!stats.success){
        res.header("Content-Type", "text/html")
        return res.send(Buffer.from(`<center><br/><br/><br/><h1>ERROR OCCURED: ${stats.message}</h1></center>`))
    }
    let data = { current_page: "HOME", stats: stats, moment: moment }
    EJS.renderFile("./templates/home.ejs", data, {}, function(err, str){ // (fileName, data, opt, callback)
        if(err) {
            res.header("Content-Type", "text/html")
            return res.send(Buffer.from(`<center><br/><br/><br/><h1>ERROR OCCURED: ${err.message}</h1></center>`))
        }
        res.header("Content-Type", "text/html")
        return res.send(Buffer.from(str))
    });
})

app.get("/all-cards", async(req,res)=> {
    let allCards = await getAllCards()
    if(!allCards.success){
        res.header("Content-Type", "text/html")
        return res.send(Buffer.from(`<center><br/><br/><br/><h1>ERROR OCCURED: ${allCards.message}</h1></center>`))
    }
    let data = { current_page: "HOME", allCards: allCards, moment: moment }
    EJS.renderFile("./templates/view-all-cards.ejs", data, {}, function(err, str){ // (fileName, data, opt, callback)
        if(err) {
            res.header("Content-Type", "text/html")
            return res.send(Buffer.from(`<center><br/><br/><br/><h1>ERROR OCCURED: ${err.message}</h1></center>`))
        }
        res.header("Content-Type", "text/html")
        return res.send(Buffer.from(str))
    });
})

app.get("/view-card/:uuid", (req,res)=> {
    return res.send("This is the view single card page")
})

app.get("/all-transactions", async(req,res)=> {
    let transactions = await getAllTransactions()
    if(!transactions.success){
        res.header("Content-Type", "text/html")
        return res.send(Buffer.from(`<center><br/><br/><br/><h1>ERROR OCCURED: ${transactions.message}</h1></center>`))
    }
    let data = { current_page: "HOME", transactions: transactions, moment: moment }
    EJS.renderFile("./templates/all-transactions.ejs", data, {}, function(err, str){ // (fileName, data, opt, callback)
        if(err) {
            res.header("Content-Type", "text/html")
            return res.sendFile(Buffer.from(`<center><br/><br/><br/><h1>ERROR OCCURED: ${err.message}</h1></center>`))
        }
        res.header("Content-Type", "text/html")
        return res.send(Buffer.from(str))
    });
})


app.get("/register-card", (req,res)=>{
    EJS.renderFile("./templates/add-card.ejs", {}, {}, function(err, str){ // (fileName, data, opt, callback)
        if(err) {
            res.header("Content-Type", "text/html")
            return res.sendFile(Buffer.from(`<center><br/><br/><br/><h1>ERROR OCCURED: ${err.message}</h1></center>`))
        }
        res.header("Content-Type", "text/html")
        return res.send(Buffer.from(str))
    });
})


const PORT = 3000
server.listen(PORT, ()=> console.log(`[${new Date()}]  Server started on http://localhost:${PORT}`))

io.on("connection", (clientSocket)=> {
    console.log(`[${new Date()}] {${clientSocket.id}}  A new Socket connected to the scoket server`)
});