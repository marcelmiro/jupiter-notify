'use strict'
const { listUsersFromRoles } = require('../../database/repositories/user-roles')
const { listRoleIdsFromPlans } = require('../../database/repositories/plans')
const { findCustomer } = require('./')
const { deleteUser } = require('../users')

module.exports = async () => {
    try {
        const ROLE_IDS = await listRoleIdsFromPlans()
        if (!ROLE_IDS || ROLE_IDS.length === 0) return
        const USERS = await listUsersFromRoles(ROLE_IDS)

        for (const user of USERS) {
            const CUSTOMER = await findCustomer(user.stripe_id)
            if (!CUSTOMER) continue
            const SUBSCRIPTION = CUSTOMER.subscriptions.data[0]
            if (!SUBSCRIPTION) {
                if (!(await deleteUser(user.user_id))) continue
                console.log(`User '${user.username}' had a subscription role without subscription. User's role has been removed.`)
            }
        }
    } catch (e) {
        console.error(e)
    }
}
