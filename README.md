# Mongoose Blockchain

Under Active Development & It is only a POC at this point
[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]
[![dependencies](https://david-dm.org/greenpioneersolutions/mongoose-blockchain.svg)](https://david-dm.org/greenpioneersolutions/mongoose-blockchain)
[![npm-issues](https://img.shields.io/github/issues/greenpioneersolutions/mongoose-blockchain.svg)](https://github.com/greenpioneersolutions/mongoose-blockchain/issues)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/greenpioneersolutions/mongoose-blockchain.svg?branch=master)](https://travis-ci.org/greenpioneersolutions/mongoose-blockchain)
[![js-standard-style](https://nodei.co/npm/mongoose-blockchain.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/mongoose-blockchain.png?downloads=true&downloadRank=true&stars=true)

[npm-image]: https://img.shields.io/npm/v/mongoose-blockchain.svg?style=flat
[npm-url]: https://npmjs.org/package/mongoose-blockchain
[downloads-image]: https://img.shields.io/npm/dt/mongoose-blockchain.svg?style=flat
[downloads-url]: https://npmjs.org/package/mongoose-blockchain

## What is Mongoose Blockchain
Introducing a simple block chain to mongoose

## Documentation

### Schema.initialize(connection)
- **Mongoose.Connection** `connection`: pass your connection in

### Schema.plugin(schema, options)
``` javascript
transactionsSchema.plugin(mongooseBlockchain.plugin, 'Transact')
//or
transactionsSchema.plugin(mongooseBlockchain.plugin, {
  field: 'user',
  model: 'Transact'
})
// All Options
{
  model: null,
  field: '_id',
  mining: 1,
  nonce: 0
}
```

### Schema.checkBlockchain(params, cb)
``` javascript
//Param Options
{
  find:{} // Mongoose find query params
  limit:0 // Mongoose limit the amount of docs
  sort:'timestamp'// sort by default with timestamp
}
```
### Schema.calculateHash(data)
- **data** `data`: pass your data in to calculate the has or use the method on your data
### Schema.getFieldLedger(doc, cb)
- Needs More Work
### Schema.validateChain(data, cb)
Used to pass multiple chains to for the plugin to use to check.
### Schema.getSettings(cb)
Used to get settings & returns settings
### Schema.setSettings(options, cb)
Used to set the settings & returns settings
### Schema.getCache()
Used to return everything cached
### Schema.clearCache(id)
Used to clear the cache or indivdual cached item


## Installation
```sh
npm i mongoose-blockchain --save
```
#### Usage
Check our examples out too

``` javascript
mongoose.connect('mongodb://localhost/mongoose-blockchain')
mongooseBlockchain.initialize(mongoose.connection)
const transactionsSchema = new mongoose.Schema({
  name: String,
  amount: Number
})
transactionsSchema.plugin(mongooseBlockchain.plugin, 'Transact')
```

## Notes
- [https://github.com/Automattic/mongoose/issues/5428](InsertMany) Does not have pre save hooks with data so do not use it - use create instead

## Known Bugs
- `DocumentNotFoundError: No document found for query "{ _id: 5a7785bb4f99e41cc4791504 }"` happens on _updateLedgerSave on line 104 . This happens when your creating multiple documents at a time.

## License

The MIT License (MIT)

Copyright (c) 2014-2018 Green Pioneer

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Created by ![Green Pioneer](http://greenpioneersolutions.com/img/icons/apple-icon-180x180.png)

#### This is [on GitHub](https://github.com/greenpioneersolutions/mongoose-blockchain)
#### Find us [on GitHub](https://github.com/greenpioneersolutions)
#### Find us [on Twitter](https://twitter.com/greenpioneerdev)
#### Find us [on Facebook](https://www.facebook.com/Green-Pioneer-Solutions-1023752974341910)
#### Find us [on The Web](http://greenpioneersolutions.com/)
