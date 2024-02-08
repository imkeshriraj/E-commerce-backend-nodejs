const express = require('express')
const cors = require('cors');
const User = require('./db/User');
const Product = require('./db/Product');
const jwt = require('jsonwebtoken');
const key = 'e-commerce';
const app = express()
const port = 2000
require('./db/config');

app.use(express.json());
app.use(cors());

app.post('/register', async (req, res) => {
  const user = new User(req.body)
  const existingEmail = await User.findOne({ email: req.body.email });
  if (existingEmail) {
    return res.status(400).send({ result: 'Email already exists' })
  }
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  jwt.sign({ email: result.email, }, key, { expiresIn: '1h' }, (err, token) => {
    res.send({ result, token });
  });
});


app.post('/login', async (req, res) => {
  if (req.body.email && req.body.password) {
    const user = await User.findOne({ email: req.body.email, password: req.body.password }).select('-password');
    if (user) {
      jwt.sign({ email: user.email, id: user._id }, key, { expiresIn: '1h' }, (err, token) => {
        res.send({ user, token });
      });
    } else {
      res.status(401).send({ result: 'No user Found' })
    }
  }
  else {
    return res.status(400).send({ result: 'Please Enter Email and Password' })
  }

});

app.post('/addProduct', verifyToken, async (req, res) => {
  const product = new Product(req.body)
  let result = await product.save();
  if (result) {
    res.send(result)
  } else {
    res.status(400).send({ result: 'Product not added' })
  }
});

app.get('/getProducts', verifyToken, async (req, res) => {
  const products = await Product.find();
  res.send(products)
})
app.delete('/deleteProduct/:id', async (req, res) => {
  const result = await Product.findByIdAndDelete(req.params.id);
  if (result) {
    res.send(result)
  } else {
    res.status(400).send({ result: 'No Product Found' })
  }
});

app.get('/getProductById/:id', verifyToken, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product)
  } else {
    res.status(400).send({ result: 'No Product Found' })
  }
});

app.put('/updateProduct/:id', verifyToken, async (req, res) => {

  const updateProduct = await Product.findByIdAndUpdate(req.params.id, { ...req.body });
  if (updateProduct) {
    res.send(updateProduct);
  } else {
    res.status(400).send({ result: 'No Product Found' })
  }
});

app.get('/searchProduct/:key', verifyToken, async (req, res) => {


  const products = await Product.find({
    '$or': [
      { name: { $regex: new RegExp(req.params.key, 'i') } },
      { category: { $regex: new RegExp(req.params.key, 'i') } },
      { brand: { $regex: new RegExp(req.params.key, 'i') } }
    ]
  });
  if (products) {
    res.send(products)
  } else {
    res.status(400).send({ result: 'No Product Found' })
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!d')
})


function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    jwt.verify(token, key, (err, authData) => {
      if (err) {
        res.status(403).send({ result: 'Auth failed' });
      } else {
        req.authData = authData;
        next();
      }
    });
  } else {
    res.status(403).send({ result: 'Auth token not found' });
  }
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
