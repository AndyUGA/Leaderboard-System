const express = require('express');
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");


app.get('/', (req, res) => {
    res.send("Hello World!");
})



const uri = "mongodb+srv://andy:test123@cluster0-iuoam.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("element3");
  collection.insertOne( { item: "card", qty: 15 } );
});










app.listen(3000, () => {
    console.log("Sever started!")
});