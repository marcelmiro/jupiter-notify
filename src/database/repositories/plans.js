'use strict'
const client = require('../../config/database')
const model = require('../models/plans')

const listPlans = async () => {
    return (await client.query('SELECT * FROM plans')).rows
}

const listPlansAndRoles = async () => {
    return (
        await client.query('SELECT *, roles.role_id FROM plans INNER JOIN roles ON plans.role_id = roles.role_id')
    ).rows
}

const listRoleIdsFromPlans = async () => {
    const plans = await listPlans() || []
    return [...new Set(plans.map(plan => plan.role_id))]
}

const listCurrenciesFromPlans = async () => {
    const plans = await listPlans() || []
    return [...new Set(plans.map(plan => plan.currency))]
}

const listCurrenciesFromRoleId = async roleId => {
    await model.roleId.validateAsync(roleId)
    const plans = await listPlans() || []
    return [...new Set(
        plans.filter(plan => plan.role_id === parseInt(roleId)).map(plan => plan.currency)
    )]
}

const findPlan = async id => {
    await model.planId.validateAsync(id)
    return (
        await client.query('SELECT * FROM plans WHERE plan_id = $1 LIMIT 1', [id])
    ).rows[0]
}

const findPlanByRoleAndCurrency = async (roleId, currency) => {
    await Promise.all([
        model.roleId.validateAsync(roleId),
        model.currency.validateAsync(currency)
    ])
    return (
        await client.query(
            'SELECT * FROM plans WHERE role_id = $1 AND currency = $2 LIMIT 1',
            [roleId, currency.toLowerCase()]
        )
    ).rows[0]
}

const insertPlan = async ({ planId, roleId, currency }) => {
    await model.insertPlan.validateAsync({ planId, roleId, currency })
    return await client.query(
        'INSERT INTO plans (plan_id, role_id, currency) VALUES ($1, $2, $3)',
        [planId, roleId, currency]
    )
}

const deletePlan = async planId => {
    await model.planId.validateAsync(planId)
    return await client.query('DELETE FROM plans WHERE plan_id = $1', [planId])
}

const deletePlanByRole = async roleId => {
    await model.roleId.validateAsync(roleId)
    return await client.query('DELETE FROM plans WHERE role_id = $1', [roleId])
}

module.exports = {
    listPlans,
    listPlansAndRoles,
    listRoleIdsFromPlans,
    listCurrenciesFromPlans,
    listCurrenciesFromRoleId,
    findPlan,
    findPlanByRoleAndCurrency,
    insertPlan,
    deletePlan,
    deletePlanByRole
}
