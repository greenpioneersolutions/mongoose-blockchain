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
  } else {
    BlockchainLedger.findOne({ model: settings.model, field: settings.field }).then(
      function (ledger) {
        if (!ledger) {
          ledger = new BlockchainLedger({
            model: settings.model,
            field: settings.field,
            hash: SHA256(Date.now() + 'StarterBlockMakeThisASetting' + settings.nonce).toString()
          })
          ledger.save()
        }
      }
    ).catch(err => {
      if (err) throw new Error(err)
    })
  }

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
      default: SHA256(Date.now() + 'StarterBlockMakeThisASetting' + settings.nonce).toString()
    }
  })
  schema.pre('save', function (next) {
    var doc = this
    if (doc.isNew) {
      doc.hash = SHA256(doc.timestamp + Date.now() + JSON.stringify(doc) + settings.nonce).toString()
      let search = { model: settings.model, field: settings.field }
      if (settings.field !== '_id')search.fieldData = doc[settings.field]
      BlockchainLedger.findOne(search).then(
              function (updateLedger) {
                if (!updateLedger) {
                  search.lastHash = doc.hash
                  let newBlockchainLedger = new BlockchainLedger(search)
                  newBlockchainLedger.save(function () {
                    next()
                  })
                } else {
                  doc.previousHash = updateLedger.lastHash
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
}
