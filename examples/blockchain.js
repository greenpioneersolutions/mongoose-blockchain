const mongoose = require('mongoose')
const async = require('async')
const mongooseBlockchain = require('..')
let connection
mongoose.Promise = global.Promise
mongoose.set('debug', false)
mongoose.connect('mongodb://localhost/mongoose-blockchain', {})
connection = mongoose.connection
mongooseBlockchain.initialize(connection)
const userSchema = new mongoose.Schema({
  name: String
})
const transactionsSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  active: Boolean,
  account: {
    checking: Boolean,
    saving: Boolean
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})
transactionsSchema.plugin(mongooseBlockchain.plugin, 'Transact')
const User = connection.model('User', userSchema)
const Transact = connection.model('Transact', transactionsSchema)
const user1 = new User({ name: 'Charlie' })
const user2 = new User({ name: 'Jason' })
const purchases = {
  jason1: new Transact({ name: 'Food', amount: 10, active: true, user: user1._id }),
  charlie2: new Transact({ name: 'Movies', amount: 20, active: true, user: user2._id }),
  charlie3: new Transact({ name: 'Resturant', amount: 40, active: true, user: user2._id }),
  jason4: new Transact({ name: 'Food', amount: 14, active: true, user: user1._id }),
  charlie5: new Transact({ name: 'Gas', amount: 31, active: true, user: user2._id })
}
async.series({
  jason1 (cb) {
    purchases.jason1.save(cb)
  },
  charlie2 (cb) {
    purchases.charlie2.save(cb)
  },
  charlie3 (cb) {
    purchases.charlie3.save(cb)
  },
  jason4 (cb) {
    purchases.jason4.save(cb)
  },
  charlie5 (cb) {
    purchases.charlie5.save(cb)
  }
}, function assert (err, results) {
  if (err)console.log(err, 'err')
  for (let record in results) {
    if (record === 'jason1')console.log(`The Start ${results[record].previousHash}`)
    console.log(`${results[record].previousHash} > ${results[record].hash}  >> `)
  }
})
