const mongodb = require('mongodb')
const getDb = require('../util/database').getDb;

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart; // {items: []}
    this._id = id ? new mongodb.ObjectId(id) : null;
  }


  save() {
    const db = getDb();

    return db
      .collection('users')
      .insertOne(this)

      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      })
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    }
    else {
      updatedCartItems.push({ productId: new mongodb.ObjectId(product._id), quantity: newQuantity });
    }


    const updatedCart = { items: updatedCartItems };

    const db = getDb();

    return db
      .collection('users')
      .updateOne(
        { _id: this._id },
        {
          $set: { cart: updatedCart }
        })
  }

  getCart() {
    const db = getDb();

    const productIds = this.cart.items.map(i => {
      return i.productId;
    })


    return db.collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then(products => {
        return products.map(p => {
          return {
            ...p, quantity: this.cart.items.find(i => {
              return i.productId.toString() === p._id.toString();
            }).quantity
          }
        })
      });


  }

  deleteCartItemById(prodId) {
    let updatedCartItems = [...this.cart.items]
    const cartProductIndex = this.cart.items.findIndex(cp => {

      return cp.productId.toString() === prodId.toString();

    });



    updatedCartItems = updatedCartItems.splice(cartProductIndex, 1);



    const updatedCart = { items: updatedCartItems };

    const db = getDb();

    return db
      .collection('users')
      .updateOne(
        { _id: this._id },
        {
          $set: { cart: updatedCart }
        })

  }

  addOrder() {
    const db = getDb();
    return this.getCart().then(products => {
      const order = {
        items: products,
        user: {
          _id: this._id,
          name: this.name
        }
      };
      return db.collection('orders').insertOne(order)
    })
      .then(result => {
        this.cart = { items: [] }
        return db
          .collection('users')
          .updateOne(
            { _id: this._id },
            {
              $set: { cart: this.cart }
            })
      })
      .catch(err => {
        console.log(err);
      })

  }

  getOrders() {
    const db = getDb();
    return db.collection("orders")
    .find({ 'user._id': this._id })
    .toArray();




  }


  static findUserById(userId) {
    const db = getDb();

    return db.collection('users')
      .find({ _id: new mongodb.ObjectId(userId) })
      .next()
      .then(user => {
        console.log(user);
        return user;
      }).catch(err => {
        console.log(err);
      })


  }


}






module.exports = User;
