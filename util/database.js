const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db ;

const mongoConnect = callback => {
  MongoClient.connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster1.bcjhxwl.mongodb.net/shop?retryWrites=true&w=majority`
  )
    .then(client => {
      console.log('Connected!');
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log(err);
    });
};

const getDb = ()=>{
  if(_db){
    return _db;
  }
  throw "no database found";
}


exports.mongoConnect = mongoConnect;

exports.getDb = getDb;