const async = require('async')
const should = require('chai').should()
const mongoose = require('mongoose')
const mongooseBlockchain = require('..')
var connection

before(function (done) {
  mongoose.Promise = global.Promise
  mongoose.set('debug', false)
  mongoose.connect('mongodb://localhost/mongoose-blockchain', {})
  connection = mongoose.connection
  connection.on('error', function (error) {
    console.log('MongoDB Connection Error ', error)
  })
  connection.on('open', function () {
    mongooseBlockchain.initialize(connection)
    done()
  })
})

after(function (done) {
  done()
})

afterEach(function (done) {
  connection.model('User').collection.drop(function () {
    delete connection.models.User
    connection.model('Transact').collection.drop(function () {
      delete connection.models.Transact
      connection.model('BlockchainLedger').collection.drop(done)
    })
  })
})

describe('mongoose-blockchain', function () {
  it('create a block chain on all transaction data', function (done) {
    var userSchema = new mongoose.Schema({
      name: String
    })
    var transactionsSchema = new mongoose.Schema({
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
    transactionsSchema.plugin(mongooseBlockchain.plugin, 'Transact')
    // Register Model
    var User = connection.model('User', userSchema)
    var Transact = connection.model('Transact', transactionsSchema)
    // Create Users
    var user1 = new User({ name: 'Charlie' })
    var user2 = new User({ name: 'Jason' })
    // Create Purchases
    var purchases = {
      jason1: new Transact({ name: 'Food', amount: 10, active: true, user: user1._id }),
      charlie2: new Transact({ name: 'Movies', amount: 20, active: true, user: user2._id }),
      charlie3: new Transact({ name: 'Resturant', amount: 40, active: true, user: user2._id }),
      jason4: new Transact({ name: 'Food', amount: 14, active: true, user: user1._id }),
      charlie5: new Transact({ name: 'Gas', amount: 31, active: true, user: user2._id })
    }
    // Create All Save by looping oveer
    async.series({
      jason1: function (cb) {
        purchases.jason1.save(cb)
      },
      charlie2: function (cb) {
        purchases.charlie2.save(cb)
      },
      charlie3: function (cb) {
        purchases.charlie3.save(cb)
      },
      jason4: function (cb) {
        purchases.jason4.save(cb)
      },
      charlie5: function (cb) {
        purchases.charlie5.save(cb)
      }
    }, function assert (err, results) {
      should.not.exist(err)
      results.jason1.should.have.property('amount', 10)
      results.charlie2.should.have.property('previousHash', results.jason1.hash)
      results.charlie3.should.have.property('previousHash', results.charlie2.hash)
      results.jason4.should.have.property('previousHash', results.charlie3.hash)
      results.charlie5.should.have.property('previousHash', results.jason4.hash)
      done()
    })
  })
  it('create a block chain per user in transaction data', function (done) {
    // Create Schemas
    var userSchema = new mongoose.Schema({
      name: String
    })
    var transactionsSchema = new mongoose.Schema({
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
    var User = connection.model('User', userSchema)
    var Transact = connection.model('Transact', transactionsSchema)
    // Create Users
    var user1 = new User({ name: 'Charlie' })
    var user2 = new User({ name: 'Jason' })
    // Create Purchases
    var purchases = {
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
    var names = ['charlie', 'jason']
    names.forEach(element => {
      for (let i = 1; i < 11; i++) {
        purchases.save[element + 'purchase' + i] = function (cb) {
          purchases[element]['purchase' + i].save(cb)
        }
      }
    })
    async.series(purchases.save, function assert (err, results) {
      should.not.exist(err)
      results.jasonpurchase1.should.have.property('amount', 10)
      results.jasonpurchase2.should.have.property('previousHash', results.jasonpurchase1.hash)
      results.jasonpurchase3.should.have.property('previousHash', results.jasonpurchase2.hash)
      results.jasonpurchase4.should.have.property('previousHash', results.jasonpurchase3.hash)
      results.jasonpurchase5.should.have.property('previousHash', results.jasonpurchase4.hash)
      results.jasonpurchase6.should.have.property('previousHash', results.jasonpurchase5.hash)
      results.jasonpurchase7.should.have.property('previousHash', results.jasonpurchase6.hash)
      results.jasonpurchase8.should.have.property('previousHash', results.jasonpurchase7.hash)
      results.jasonpurchase9.should.have.property('previousHash', results.jasonpurchase8.hash)
      results.jasonpurchase10.should.have.property('previousHash', results.jasonpurchase9.hash)
      results.charliepurchase1.should.have.property('amount', 10)
      results.charliepurchase2.should.have.property('previousHash', results.charliepurchase1.hash)
      results.charliepurchase3.should.have.property('previousHash', results.charliepurchase2.hash)
      results.charliepurchase4.should.have.property('previousHash', results.charliepurchase3.hash)
      results.charliepurchase5.should.have.property('previousHash', results.charliepurchase4.hash)
      results.charliepurchase6.should.have.property('previousHash', results.charliepurchase5.hash)
      results.charliepurchase7.should.have.property('previousHash', results.charliepurchase6.hash)
      results.charliepurchase8.should.have.property('previousHash', results.charliepurchase7.hash)
      results.charliepurchase9.should.have.property('previousHash', results.charliepurchase8.hash)
      results.charliepurchase10.should.have.property('previousHash', results.charliepurchase9.hash)
      done()
    })
  })
})
