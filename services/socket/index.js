'use strict'
const io = require('../../config/socket').getIo()
const socket = require('./auth')(io)
console.log(socket)
