const app = require("express")()
const body_parser = require("body-parser")
const cors = require("cors")
const socketIo = require("socket.io")
const cardsRouter = require('./routes/cards.route')
const transactionsRouter = require('./routes/transactions.route')
require("./database/index")

var server = require("http").Server(app)
const io = socketIo(server)

app.use(cors({}));
app.use(body_parser.urlencoded({extended: true}));
app.use(body_parser.json());

app.set("IO", io);
app.set('view engine', 'ejs');

app.use("/api/cards", cardsRouter)
app.use("/api/transactions", transactionsRouter)

app.get("/", (req,res)=> {
    return res.send("This is the landing page")
})

app.get("/all-cards", (req,res)=> {
    return res.send("This is the view all cards page")
})

app.get("/view-card/:uuid", (req,res)=> {
    return res.send("This is the view single card page")
})

app.get("/all-transactions", (req,res)=> {
    return res.send("This is the view all transactions page")
})

io.on("connection", (clientSocket)=> {
    console.log(`[${new Date()}] {${clientSocket.id}}  A new Socket connected to the scoket server`)
});

const PORT = 3000
server.listen(PORT, ()=> console.log(`[${new Date()}]  Server started on http://localhost:${PORT}`))