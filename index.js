const SHA256 = require('crypto-js/sha256')
const mongoose = require('mongoose')
var blockchainLedgerSchema
var BlockchainLedger

exports.initialize = function (connection) {
  try {
    BlockchainLedger = connection.model('BlockchainLedger')
  } catch (ex) {
    if (ex.name === 'MissingSchemaError') {
      blockchainLedgerSchema = new mongoose.Schema({
        model: { type: String, required: true },
        field: { type: String, required: true },
        fieldData: { type: String },
        lastHash: { type: String, required: true }
      })
      blockchainLedgerSchema.index({ field: 1, fieldData: 1, lastHash: 1, model: 1 })
      BlockchainLedger = connection.model('BlockchainLedger', blockchainLedgerSchema)
    } else { throw ex }
  }
}

exports.plugin = function (schema, options) {
  if (!blockchainLedgerSchema || !BlockchainLedger) throw new Error('mongoose-blockchain has not been initialized')
  let fields = {}
  let settings = {
    model: null,
    field: '_id',
    mining: 1,
    nonce: 0
  }
  setSettings(options)
  schema.add({
    hash: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now()
    },
    previousHash: {
      type: String,
      default: calculateHash({timestamp: Date.now(), text: 'StarterBlockMakeThisASetting'})
    }
  })
  schema.pre('save', function (next) {
    var doc = this
    if (doc.isNew) {
      let search = { model: settings.model, field: settings.field }
      if (settings.field !== '_id')search.fieldData = doc[settings.field]
      BlockchainLedger.findOne(search).then(function (updateLedger) {
        if (!updateLedger) {
          doc.hash = calculateHash(doc._doc)
          search.lastHash = doc.hash
          let newBlockchainLedger = new BlockchainLedger(search)
          newBlockchainLedger.save(function () {
            next()
          })
        } else {
          doc.previousHash = updateLedger.lastHash
          doc.hash = calculateHash(doc._doc)
          updateLedger.lastHash = doc.hash
          updateLedger.save(function () {          
            next()
          })
        }
      }).catch(err => {
        if (err) return next(err)
      })
    } else {
      next()
    }
  })
  function validateChain (data, cb) {
    if (data.length < 2) {
      return cb(null, true)
    }
    for (let i = 1; i < data.length; i++) {
      const currentBlock = data[i]
      const previousBlock = data[i - 1]
      if (currentBlock.hash !== calculateHash(currentBlock._doc)) {
        cb(null, false)
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        cb(null, false)
      }
    }
    return cb(null, true)
  }
  function checkBlockchain (params, cb) {
    let search = {}
    let limit = 0
    let sort = 'timestamp'
    if (typeof params === 'function') cb = params
    else {
      if (params.find)search = params.find
      if (params.limit)search = params.limit > 1 ? params.limit : 0
      if (params.sort)search = params.sort
    }
    mongoose.model(settings.model).find(search).limit(limit).sort(sort).then(function (data) {
      if (settings.field !== '_id') {
        let fieldGroupings = {}
        for (let i = 0; i < data.length; i++) {
          let id = data[i][settings.field]
          if (!fieldGroupings[id])fieldGroupings[id] = [data[i]]
          else fieldGroupings[id].push(data[i])
        }
        let error = null
        let validated = true
        let keys = Object.keys(fieldGroupings)
        for (let k = 0; k < keys.length; k++) {
          validateChain(fieldGroupings[keys[k]], function (err, valid) {
            if (err) error = err
            if (!valid)validated = valid
          })
        }
        cb(error, validated)
      } else {
        validateChain(data, function (err, valid) {
          cb(err, valid)
        })
      }
    }).catch(function (err) {
      cb(err, false)
    })
  }

  function calculateHash (obj) {
    let data = {}
    Object.keys(schema.tree).forEach(function (n) {
      if (n === '__v') return
      if (n === 'hash') return
      data[n] = obj[n]
    })
    return SHA256(data.timestamp + JSON.stringify(data)).toString()
  }

  function getFieldLedger (doc, cb) {
    let search = { model: settings.model, field: settings.field }
    if (settings.field !== '_id')search.fieldData = doc[settings.field]
    BlockchainLedger.findOne(search).then(function (ledger) {
      cb(null, ledger)
    }).catch(err => {
      cb(err)
    })
  }
  function getSettings(cb){
    if(typeof cb === 'function'){
      cb(settings)
    }else{
      return settings
    }
  }
  function setSettings(options, cb){
    fields = {}
    switch (typeof (options)) {
      case 'string':
        settings.model = options
        break
      case 'object':
        settings = Object.assign({}, settings, options)
        break
    }
    if (settings.model == null) throw new Error('model must be set')
    fields[settings.field] = {
      type: String,
      require: true
    }
    if (settings.field !== '_id') {
      blockchainLedgerSchema.add(fields)
    }
    if(typeof cb === 'function'){
      cb(settings)
    }else{
      return settings
    }
  }
  schema.method('getSettings', getSettings)
  schema.static('getSettings', getSettings)
  schema.method('setSettings', setSettings)
  schema.static('setSettings', setSettings)
  schema.method('checkBlockchain', checkBlockchain)
  schema.static('checkBlockchain', checkBlockchain)
  schema.method('calculateHash', calculateHash)
  schema.static('calculateHash', calculateHash)
  schema.method('getFieldLedger', getFieldLedger)
  schema.static('getFieldLedger', getFieldLedger)
}
