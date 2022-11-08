const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()
console.log(process.env.DB_USER, process.env.DB_PASSWORD)

// middleware 

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n58ahyf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollection = client.db("packersService").collection("services");
        app.get('/servicessample', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).limit(3)
            const servicesData = await cursor.toArray()
            res.send(servicesData)
        })

    } finally {
        //   await client.close();
    }
}
run().catch(err => console.log(err));


app.get('/', (req, res) => {
    res.send('Service review project server running')
});

app.listen(port, () => {
    console.log(`project server running on port ${port}`)
})

