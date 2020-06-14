'use strict'
const Joi = require('@hapi/joi')

const pay = async (req, res) => {
    try {

    } catch (e) {
        console.error('Route \'/stripe/pay\': ' + e.message)
        res.redirect('/')
    }
}

const success = async (req, res) => {
    try {

    } catch (e) {
        console.error('Route \'/stripe/success\': ' + e.message)
        res.redirect('/')
    }
}

const fail = async (req, res) => {
    try {

    } catch (e) {
        console.error('Route \'/stripe/fail\': ' + e.message)
        res.redirect('/')
    }
}

const cancelMembership = async (req, res) => {
    try {

    } catch (e) {
        console.error('Route \'/stripe/cancel-membership\': ' + e.message)
        res.redirect('/')
    }
}

const renewMembership = async (req, res) => {
    try {

    } catch (e) {
        console.error('Route \'/stripe/renew-membership\': ' + e.message)
        res.redirect('/')
    }
}

const transferMembership = async (req, res) => {
    try {

    } catch (e) {
        console.error('Route \'/stripe/transfer-membership\': ' + e.message)
        res.redirect('/')
    }
}

const webhook = async (req, res) => {
    try {

    } catch (e) {
        console.error('Route \'/stripe/webhook\': ' + e.message)
        res.status(400).send('Route \'/stripe/webhook\': ' + e.message)
    }
}

module.exports = { pay, success, fail, cancelMembership, renewMembership, transferMembership, webhook }
