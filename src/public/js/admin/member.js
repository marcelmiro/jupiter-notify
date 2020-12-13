'use strict'
const socket = window.socket

// eslint-disable-next-line no-new
new window.Vue({
    el: 'main',
    data: {
        statusColors: {
            success: '#3EAD34',
            danger: '#D43435',
            warning: '#D9A712',
            default: '#555555'
        },
        subscriptionStatuses: {
            success: ['active'],
            danger: ['cancel', 'canceling', 'cancelling', 'canceled', 'cancelled', 'incomplete_expired'],
            warning: ['trial', 'trialing', 'trialling', 'past due', 'unpaid', 'incomplete']
        },
        invoiceStatuses: {
            success: ['paid'],
            danger: ['void', 'uncollectible'],
            warning: ['draft', 'open']
        },
        roles: [],
        member: {
            role: {},
            subscription: { lastInvoice: {} }
        },
        editMember: {},
        editMemberFlag: false
    },
    methods: {
        copy: async function (value) {
            if (!value) return
            try {
                await navigator.clipboard.writeText(value)
            } catch (e) {
                const el = document.createElement('textarea')
                el.value = value
                el.setAttribute('readonly', '')
                el.style.position = 'absolute'
                el.style.left = '-9999px'
                document.body.appendChild(el)
                try {
                    el.select()
                    document.execCommand('copy')
                } catch (e) {
                    console.error('Can\'t copy value to clipboard.')
                } finally { document.body.removeChild(el) }
            }
        },
        findStatusColor: function (value, list) {
            const status = list ? Object.keys(list).find(key => list[key].includes(value)) : undefined
            return this.statusColors[status] || this.statusColors.default
        },
        updateMember: function () {
            socket.emit('update-member', { userId: this.member.userId, ...this.editMember })
            this.editMemberFlag = true
        },
        cancelSubscription: function () {
            socket.emit('cancel-subscription', this.member.userId)
        },
        deleteMember: function () {
            socket.emit('delete-member', this.member.userId)
        }
    },
    computed: {
        roleNames: function () {
            return this.roles.map(role => role.name)
        }
    },
    created () {
        this.roles = window.roles
            ? window.roles.sort((a, b) => {
                if (a.importance && b.importance) {
                    if (a.importance < b.importance) return -1
                    else if (a.importance > b.importance) return 1
                } else if (!a.importance && b.importance) return 1
                else if (!b.importance && a.importance) return -1

                if (!a.name) return 1
                else if (!b.name) return -1
                else if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
                else if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
                return 0
            })
            : []

        socket.on('send-message', msg => alert(msg))
        socket.on('send-error', msg => {
            console.error(msg)
            alert(msg)
        })

        socket.on('set-member', member => {
            this.member = member
            if (member) {
                this.editMember = Object.assign({}, this.editMember, {
                    role: member.role.name,
                    currency: member.subscription.currency
                })
            }
        })
        socket.on('update-member', () => {
            socket.emit('get-member', window.userId)
            this.editMemberFlag = false
            this.$refs.editMember.close()
            this.$refs.deleteMember.close()
        })
        socket.on('delete-member', () => { window.location.href = '/admin/members' })

        if (window.userId) socket.emit('get-member', window.userId)
    }
})
