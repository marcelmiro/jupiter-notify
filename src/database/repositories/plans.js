'use strict'
const client = require('../../config/database')
const model = require('../models/plans')

const listPlans = async () => {
    return (await client.query('SELECT * FROM plans')).rows
}

const listRoleIdsFromPlans = async () => {
    const PLANS = await listPlans() || []
    return [...new Set(PLANS.map(plan => plan.role_id))]
}

const listCurrenciesFromPlans = async () => {
    const PLANS = await listPlans() || []
    return [...new Set(PLANS.map(plan => plan.currency))]
}

const findPlan = async id => {
    await model.planId.validateAsync(id)
    return (await client.query('SELECT * FROM plans WHERE plan_id = $1 LIMIT 1', [id])).rows[0]
}

const findPlanByRoleAndCurrency = async (roleId, currency) => {
    await model.roleId.validateAsync(roleId)
    await model.currency.validateAsync(currency)
    return (
        await client.query(
            'SELECT * FROM plans WHERE role_id = $1 AND currency = $2 LIMIT 1',
            [roleId, currency.toLowerCase()]
        )
    ).rows[0]
}

module.exports = { listPlans, listRoleIdsFromPlans, listCurrenciesFromPlans, findPlan, findPlanByRoleAndCurrency }
