const express = require('express');
const cors = require('cors');
const jsonwebtoken = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hozjr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const productCollection = client.db('workoutGears').collection('product')
        const supplierInfoCollection = client.db('suppliers').collection('info')


        app.post('getToken',async(req,res)=>{
            const user =req.body
            const accessToken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
                expiresIn:'7d'
            })
            res.send({accessToken})

        })

        app.get('/product', async (req, res) => {

            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })
        app.get('/suppliers', async (req, res) => {

            const query = {};
            const cursor = supplierInfoCollection.find(query);
            const suppliers = await cursor.toArray();
            res.send(suppliers)
        })


        app.get('/product/:id', async (req, res) => {
            // console.log(req.params);
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productCollection.findOne(query)
            res.send(product)
        })

        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const updateproduct = req.body;
            // console.log( req.body);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    name: updateproduct.name,
                    quantity: updateproduct.quantity,
                    price: updateproduct.price,
                    email:updateproduct.email,
                    img: updateproduct.img,
                    description: updateproduct.description,
                    supplier: updateproduct.supplier

                }
            };
            const result = await productCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        })
        app.post('/product', async(req, res) =>{
            const newProduct = req.body;
            console.log('adding new user', newProduct);
            const result = await productCollection.insertOne(newProduct);
            res.send(result)
        });
        app.get('/ordered',async(req,res)=>{
            const email=(req.query.email);
            const query = {email:email};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)

        })
    }
    finally {

    }
}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('warehouse is running and  waiting for data')
})
app.listen(port, () => {
    console.log('warehouse is running on port : ', port);
})