const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware 

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n58ahyf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// jwt verification 
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })

}
async function run() {
    try {
        const serviceCollection = client.db("packersService").collection("services");
        const reviewCollection = client.db("packersService").collection("reviews");

        // send jwt from client side 
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })

        // get limited data for homepage 
        app.get('/servicessample', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).limit(3).sort({ _id: -1 })
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
        app.get('/reviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log('inside reviews api', decoded)
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }
            let query = {}
            if (req.query.email) {
                query = { email: req.query.email }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        //  deltete  reviews by id query
        app.delete('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deletedReview = await reviewCollection.deleteOne(query);
            res.send(deletedReview)
        });
        // edit data by filtering 
        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = await reviewCollection.updateOne({ _id: ObjectId(id) }, { $set: req.body })
            console.log(updatedData)
            res.send(updatedData)
        });
        // load specific data for edit 
        app.get('/myreviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const filteredData = await reviewCollection.findOne(query);
            res.send(filteredData)
        })
        // insert data on service collection
        app.post('/addservice', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            console.log(result)
            res.send(result)
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

