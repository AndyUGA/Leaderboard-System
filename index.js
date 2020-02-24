const express = require('express');
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
var expressLayouts = require('express-ejs-layouts');
const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");


app.get('/', (req, res) => {

    res.render("home", {
        title: "Home"
    });
})

app.get('/scanner', (req, res) => {
    res.render("scanner", {
        title: "QR Code Scanner"
    });
})



/*
const uri = "mongodb+srv://andy:test123@cluster0-iuoam.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("element3");
});
*/



app.listen(3000, () => {
    console.log("Sever started on port " + 3000);
});