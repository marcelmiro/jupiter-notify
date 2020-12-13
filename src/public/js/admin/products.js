'use strict'
const socket = window.socket

// eslint-disable-next-line no-new
new window.Vue({
    el: 'main',
    data: {
        role: '',
        roles: [],
        products: [],
        initSize: 10,
        listSize: 0,
        addProductObject: {},
        deleteProductId: ''
    },
    methods: {
        openDeleteProduct: function (id) {
            this.deleteProductId = id
            this.$refs.deleteProduct.open()
        },
        addProduct: function () {
            if (!this.addProductObject) return alert('No product selected to be created.')
            socket.emit('add-product', this.addProductObject)
        },
        deleteProduct: function () {
            if (!this.deleteProductId) return alert('No product selected to be deleted.')
            socket.emit('delete-product', this.deleteProductId)
        }
    },
    computed: {
        roleNames: function () {
            return this.roles.map(role => role.name)
        },
        productRoleNames: function () {
            if (!this.products || this.products.length === 0) return []
            return [...new Set(this.products.map(product => product.role.name))]
        },
        filteredProducts: function () {
            if (!this.products || this.products.length === 0) return []
            const products = this.products.filter(product => {
                return this.role.toLowerCase() !== 'all'
                    ? product.role.name.toLowerCase() === this.role.toLowerCase()
                    : true
            })

            // Sort list by role importance -> role name -> product id
            return products.sort((a, b) => {
                if (a.role.importance && b.role.importance) {
                    if (a.role.importance < b.role.importance) return -1
                    else if (a.role.importance > b.role.importance) return 1
                } else if (!a.role.importance && b.role.importance) return 1
                else if (!b.role.importance && a.role.importance) return -1

                if (a.role.name.toLowerCase() < b.role.name.toLowerCase()) return -1
                else if (a.role.name.toLowerCase() > b.role.name.toLowerCase()) return 1

                if (a.id.toLowerCase() < b.id.toLowerCase()) return -1
                else if (a.id.toLowerCase() > b.id.toLowerCase()) return 1
                else return 0
            })
        },
        paginatedProducts: function () {
            return this.filteredProducts.slice(0, this.listSize)
        }
    },
    watch: {
        role: function () { this.listSize = this.initSize }
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

        socket.on('get-products', () => socket.emit('get-products'))
        socket.on('set-products', products => { this.products = products })
        socket.on('add-product', () => {
            this.$refs.addProduct.close()
            this.addProductObject = {}
        })
        socket.on('delete-product', () => this.$refs.deleteProduct.close())

        socket.emit('get-products')
    }
})
