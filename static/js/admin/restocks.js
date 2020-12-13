'use strict'
const socket = window.socket

// eslint-disable-next-line no-new
new window.Vue({
    el: 'main',
    data: {
        role: '',
        roles: [],
        inStock: false,
        inStockTimer: false,
        restocks: [],
        initSize: 10,
        listSize: 0,
        addRestockObject: {},
        editRestock: {},
        deleteRestockPassword: ''
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
        convertToDateTime: function (date) {
            date = new Date(date)
            if (!date) return

            const ten = value => (value < 10 ? '0' : '') + value
            const YYYY = date.getFullYear()
            const MM = ten(date.getMonth() + 1)
            const DD = ten(date.getDate())
            const hh = ten(date.getHours())
            const mm = ten(date.getMinutes())
            const ss = ten(date.getSeconds())

            return YYYY + '-' + MM + '-' + DD + 'T' + hh + ':' + mm + ':' + ss
        },
        openEditRestock: function (restock) {
            let dateTime
            if (parseInt(restock.date)) dateTime = this.convertToDateTime(new Date(parseInt(restock.date)))

            this.editRestock = {
                password: restock.password,
                stock: restock.total,
                date: restock.date || undefined,
                dateTime
            }
            this.$refs.editRestock.open()
        },
        openDeleteRestock: function (password) {
            this.deleteRestockPassword = password
            this.$refs.deleteRestock.open()
        },
        addRestock: function () {
            if (!this.addRestockObject) return alert('No restock selected to be created.')
            socket.emit('add-restock', this.addRestockObject)
        },
        updateRestock: function () {
            if (!this.editRestock) return alert('No restock selected to be updated.')
            socket.emit('update-restock', this.editRestock)
        },
        deleteRestock: function () {
            if (!this.deleteRestockPassword) return alert('No restock selected to be deleted.')
            socket.emit('delete-restock', this.deleteRestockPassword)
        },
        updateInStock: async function () {
            if (this.inStockTimer) return
            this.inStockTimer = true
            await new Promise(resolve => setTimeout(resolve, 3000))
            if (this.inStockTimer) socket.emit('update-in-stock', this.inStock)
            this.inStockTimer = false
        }
    },
    computed: {
        roleNames: function () {
            return this.roles.map(role => role.name)
        },
        restockRoleNames: function () {
            if (!this.restocks || this.restocks.length === 0) return []
            return [...new Set(this.restocks.map(restock => restock.role.name))]
        },
        filteredRestocks: function () {
            if (!this.restocks || this.restocks.length === 0) return []
            const restocks = this.restocks.filter(restock => {
                return this.role.toLowerCase() !== 'all'
                    ? restock.role.name.toLowerCase() === this.role.toLowerCase()
                    : true
            })

            // Sort list by restock status -> role importance -> role name -> password
            return restocks.sort((a, b) => {
                if (!a.active || !b.active) {
                    if (a.active) return -1
                    else if (b.active) return 1
                }

                if (a.role.importance && b.role.importance) {
                    if (a.role.importance < b.role.importance) return -1
                    else if (a.role.importance > b.role.importance) return 1
                } else if (!a.role.importance && b.role.importance) return 1
                else if (!b.role.importance && a.role.importance) return -1

                if (a.role.name.toLowerCase() < b.role.name.toLowerCase()) return -1
                else if (a.role.name.toLowerCase() > b.role.name.toLowerCase()) return 1

                if (a.password.toLowerCase() < b.password.toLowerCase()) return -1
                else if (a.password.toLowerCase() > b.password.toLowerCase()) return 1
                else return 0
            })
        },
        paginatedRestocks: function () {
            return this.filteredRestocks.slice(0, this.listSize)
        }
    },
    watch: {
        role: function () { this.listSize = this.initSize },
        restocks: function () {
            if (!this.restocks || this.restocks.length === 0) return
            const date = new Date().getTime()
            for (const restock of this.restocks) restock.active = !restock.date || date > restock.date
        },
        'addRestockObject.dateTime': function () {
            this.addRestockObject.date =
                new Date(this.addRestockObject.dateTime).getTime() ||
                new Date(parseInt(this.addRestockObject.dateTime)).getTime() ||
                undefined
        },
        'editRestock.dateTime': function () {
            this.editRestock.date =
                new Date(this.editRestock.dateTime).getTime() ||
                new Date(parseInt(this.editRestock.dateTime)).getTime() ||
                undefined
        }
    },
    created () {
        this.listSize = this.initSize

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

        socket.on('get-restocks', () => socket.emit('get-restocks'))
        socket.on('set-restocks', restocks => { this.restocks = restocks })
        socket.on('add-restock', () => {
            this.$refs.addRestock.close()
            this.addRestockObject = {}
        })
        socket.on('update-restock', () => this.$refs.editRestock.close())
        socket.on('delete-restock', () => this.$refs.deleteRestock.close())

        socket.on('get-in-stock', () => socket.emit('get-in-stock'))
        socket.on('set-in-stock', value => {
            this.inStockTimer = false
            this.inStock = value
        })

        socket.emit('get-restocks')
        socket.emit('get-in-stock')
    }
})
