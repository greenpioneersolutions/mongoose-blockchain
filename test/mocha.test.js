const assert = require('chai').assert
const mongoose = require('mongoose')
const mongooseBlockchain = require('..')
const seedData = require('./seed.data.json')
var connection
var userSchema = {}
var transactionsSchema = {}
userSchema = new mongoose.Schema({
  name: String
})
transactionsSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  active: {
    type: Boolean,
    default: true
  },
  account: {
    checking: Boolean,
    saving: Boolean
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

before(function (done) {
  mongoose.Promise = global.Promise
  mongoose.set('debug', false)
  mongoose.connect('mongodb://localhost/mongoose-blockchain', {
    poolSize: 50
  })
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
  delete connection.models.Transact
  delete connection.models.User
  return mongoose.connection.dropDatabase(done)
})

describe('mongoose-blockchain', function () {
  it('Schema.checkBlockchain() - create a block chain per user in transactions', function (done) {
    transactionsSchema.plugin(mongooseBlockchain.plugin, {
      field: 'user',
      model: 'Transact'
    })
    var User = connection.model('User', userSchema)
    var Transact = connection.model('Transact', transactionsSchema)
    User.create(seedData.users)
    Transact.create(seedData.transactions, function (err, results) {
      assert.equal(err, null)
      Transact.checkBlockchain(function (err, valid) {
        assert.equal(err, null)
        assert.equal(valid, true)
        done()
      })
    })
  })
  it('Schema.checkBlockchain() - create a block chain on all transactions', function (done) {
    transactionsSchema.plugin(mongooseBlockchain.plugin, 'Transact')
    var User = connection.model('User', userSchema)
    var Transact = connection.model('Transact', transactionsSchema)
    User.create(seedData.users)
    Transact.create(seedData.transactions, function (error, docs) {
      assert.equal(error, null)
      Transact.find().exec(function (err, results) {
        assert.equal(err, null)
        Transact.checkBlockchain(function (err, valid) {
          assert.equal(err, null)
          assert.equal(valid, true)
          done()
        })
      })
    })
  })
  it('Schema.getSettings()', function (done) {
    transactionsSchema.plugin(mongooseBlockchain.plugin, 'Transact')
    var User = connection.model('User', userSchema)
    var Transact = connection.model('Transact', transactionsSchema)
    User.create(seedData.users)
    Transact.create(seedData.transactions, function (error, docs) {
      assert.equal(error, null)
      Transact.find().exec(function (err, results) {
        assert.equal(err, null)
        assert.deepEqual(Transact.getSettings(), { model: 'Transact', field: '_id', mining: 1, nonce: 0, initHashText: 'StarterBlockMakeThisASetting' })
        done()
      })
    })
  })
  it('Schema.setSettings()', function (done) {
    transactionsSchema.plugin(mongooseBlockchain.plugin, 'Transact')
    var User = connection.model('User', userSchema)
    var Transact = connection.model('Transact', transactionsSchema)
    User.create(seedData.users)
    Transact.create(seedData.transactions, function (error, docs) {
      assert.equal(error, null)
      Transact.find().exec(function (err, results) {
        assert.equal(err, null)
        assert.deepEqual(Transact.getSettings(), { model: 'Transact', field: '_id', mining: 1, nonce: 0, initHashText: 'StarterBlockMakeThisASetting' })
        Transact.setSettings({
          field: 'user',
          model: 'Transact'
        })
        assert.deepEqual(Transact.getSettings(), { model: 'Transact', field: 'user', mining: 1, nonce: 0, initHashText: 'StarterBlockMakeThisASetting' })
        Transact.setSettings('Blog')
        assert.deepEqual(Transact.getSettings(), { model: 'Blog', field: 'user', mining: 1, nonce: 0, initHashText: 'StarterBlockMakeThisASetting' })
        done()
      })
    })
  })
  it('Schema.calculateHash()', function (done) {
    transactionsSchema.plugin(mongooseBlockchain.plugin, 'Transact')
    var User = connection.model('User', userSchema)
    var Transact = connection.model('Transact', transactionsSchema)
    User.create(seedData.users)
    Transact.create(seedData.transactions, function (error, docs) {
      assert.equal(error, null)
      assert.equal(Transact.calculateHash(docs[0]), docs[0].hash)
      done()
    })
  })

  it('Schema.getFieldLedger()', function (done) {
    transactionsSchema.plugin(mongooseBlockchain.plugin, 'Transact')
    var User = connection.model('User', userSchema)
    var Transact = connection.model('Transact', transactionsSchema)
    User.create(seedData.users)
    Transact.create(seedData.transactions, function (error, docs) {
      assert.equal(error, null)
      Transact.find().exec(function (err, results) {
        assert.equal(err, null)
        assert.deepEqual(Transact.getSettings(), { model: 'Transact', field: '_id', mining: 1, nonce: 0, initHashText: 'StarterBlockMakeThisASetting' })
        done()
      })
    })
  })
  it('Schema.getCache()', function (done) {
    transactionsSchema.plugin(mongooseBlockchain.plugin, 'Transact')
    var User = connection.model('User', userSchema)
    var Transact = connection.model('Transact', transactionsSchema)
    User.create(seedData.users)
    Transact.create(seedData.transactions, function (error, docs) {
      assert.equal(error, null)
      assert.notEqual(Transact.getCache(), null)
      done()
    })
  })
  it('Schema.clearCache()', function (done) {
    transactionsSchema.plugin(mongooseBlockchain.plugin, 'Transact')
    var User = connection.model('User', userSchema)
    var Transact = connection.model('Transact', transactionsSchema)
    User.create(seedData.users)
    Transact.create(seedData.transactions, function (error, docs) {
      assert.equal(error, null)
      Transact.clearCache()
      assert.deepEqual(Transact.getCache(), {})
      done()
    })
  })
})
