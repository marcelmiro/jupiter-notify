'use strict'
const { listRenewalUsers } = require('../../database/repositories/user-roles')
const { findCustomer } = require('./')
const { deleteUser } = require('../users')

module.exports = async () => {
    try {
        const USERS = await listRenewalUsers()

        for (let i = 0; i < USERS.length; i++) {
            const CUSTOMER = await findCustomer(USERS[i].stripe_id)
            if (!CUSTOMER) continue
            const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
            if (!SUBSCRIPTION) {
                if (!(await deleteUser(USERS[i].user_id))) continue
                console.log(`User '${USERS[i].username}' had renewal role without subscription. User's role has been removed.`)
            }
        }
    } catch (e) {
        console.error(e)
    }
}
