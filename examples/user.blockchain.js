const mongoose = require('mongoose')
const async = require('async')
const mongooseBlockchain = require('..')
let connection

mongoose.Promise = global.Promise
mongoose.set('debug', false)
mongoose.connect('mongodb://localhost/mongoose-blockchain', {})
connection = mongoose.connection
mongooseBlockchain.initialize(connection)
    // Create Schemas
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
    // Register Plugins
transactionsSchema.plugin(mongooseBlockchain.plugin, {
  field: 'user',
  model: 'Transact'
})
    // Register Model
const User = connection.model('User', userSchema)
const Transact = connection.model('Transact', transactionsSchema)
    // Create Users
const user1 = new User({ name: 'Charlie' })
const user2 = new User({ name: 'Jason' })
    // Create Purchases
const purchases = {
  jason: {
    purchase1: new Transact({ name: 'Food', amount: 10, active: true, user: user1._id }),
    purchase2: new Transact({ name: 'Movies', amount: 20, active: true, user: user1._id }),
    purchase3: new Transact({ name: 'Resturant', amount: 40, active: true, user: user1._id }),
    purchase4: new Transact({ name: 'Food', amount: 14, active: true, user: user1._id }),
    purchase5: new Transact({ name: 'Gas', amount: 31, active: true, user: user1._id }),
    purchase6: new Transact({ name: 'Amazon', amount: 50, active: true, user: user1._id }),
    purchase7: new Transact({ name: 'Costco', amount: 250, active: true, user: user1._id }),
    purchase8: new Transact({ name: 'Internet', amount: 90, active: true, user: user1._id }),
    purchase9: new Transact({ name: 'Food', amount: 24, active: true, user: user1._id }),
    purchase10: new Transact({ name: 'Amazon', amount: 120, active: true, user: user1._id })
  },
  charlie: {
    purchase1: new Transact({ name: 'Food', amount: 10, active: true, user: user2._id }),
    purchase2: new Transact({ name: 'Movies', amount: 20, active: true, user: user2._id }),
    purchase3: new Transact({ name: 'Resturant', amount: 40, active: true, user: user2._id }),
    purchase4: new Transact({ name: 'Food', amount: 14, active: true, user: user2._id }),
    purchase5: new Transact({ name: 'Gas', amount: 31, active: true, user: user2._id }),
    purchase6: new Transact({ name: 'Amazon', amount: 50, active: true, user: user2._id }),
    purchase7: new Transact({ name: 'Costco', amount: 250, active: true, user: user2._id }),
    purchase8: new Transact({ name: 'Internet', amount: 90, active: true, user: user2._id }),
    purchase9: new Transact({ name: 'Food', amount: 24, active: true, user: user2._id }),
    purchase10: new Transact({ name: 'Amazon', amount: 120, active: true, user: user2._id })
  },
  save: {}
}
    // Create All Save by looping oveer
const names = ['charlie', 'jason']
names.forEach(element => {
  for (let i = 1; i < 11; i++) {
    purchases.save[`${element}purchase${i}`] = cb => {
      purchases[element][`purchase${i}`].save(cb)
    }
  }
})
async.series(purchases.save, function assert (err, results) {
  if (err)console.log(err, 'err')
  for (let record in results) {
    if (record === 'jason1')console.log(`The Start ${results[record].previousHash}`)
    console.log(`${record} - ${results[record].previousHash} > ${results[record].hash}  >> `)
  }
})
