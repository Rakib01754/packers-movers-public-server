const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware 

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n58ahyf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollection = client.db("packersService").collection("services");
        const reviewCollection = client.db("packersService").collection("reviews");
        // get limited data for homepage 
        app.get('/servicessample', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).limit(3)
            const servicesData = await cursor.toArray()
            res.send(servicesData)
        });
        // get all data for service page 
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        });
        // get specific data for service details 
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        });

        // send users review to database 
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        });
        // get reviews data based on id 
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id }
            const cursor = reviewCollection.find(query).sort({ time: -1 })
            const filteredReviews = await cursor.toArray();
            res.send(filteredReviews)

        });

        // get reviews data based on email address 
        app.get('/reviews', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = { email: req.query.email }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        //এখন আমরা আইডি দিয়ে কুয়েরি করে ডাটা ডিলেট করবো

        //     app.delete('/orders/:id', async (req, res) => {
        //         const id = req.params.id;
        //         const query = { _id: ObjectId(id) }
        //         const deletedItem = await orderCollection.deleteOne(query)
        //         res.send(deletedItem)
        //     })

        // }

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

