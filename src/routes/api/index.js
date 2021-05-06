'use strict'
const bodyParser = require('body-parser')
const router = require('express').Router()
// const { authorize } = require('../../controllers/api')

router.use(bodyParser.json())
router.use((err, req, res, next) => {
    // Check if middleware error comes from 'body-parser'.
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        if (err.body === '[object Object]') { // Custom response if client didn't send body as string.
            return res.status(400).send({ message: 'Request\'s body must be sent as a string.' })
        }
        // Fallback response.
        console.error(err)
        return res.sendStatus(400)
    }
    next()
})

router.use('/discord', require('./discord'))
// router.use('/jupiterscripts', require('./jupiterscripts'))
router.use('/jupitertoolkit', require('./jupitertoolkit'))

// router.post('/authorize', authorize)

// Fallback when route doesn't exist.
router.use((req, res) => res.sendStatus(404))

module.exports = router
