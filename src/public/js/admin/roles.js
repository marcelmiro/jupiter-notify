'use strict'
const socket = window.socket

// eslint-disable-next-line no-new
new window.Vue({
    el: 'main',
    data: {
        roles: [],
        initSize: 10,
        listSize: 0,
        addRoleObject: {},
        editRole: {},
        deleteRoleId: undefined
    },
    methods: {
        openEditRole: function (role) {
            this.editRole = JSON.parse(JSON.stringify(role))
            this.$refs.editRole.open()
        },
        openDeleteRole: function (role) {
            this.deleteRoleId = role
            this.$refs.deleteRole.open()
        },
        addRole: function () {
            if (!this.addRoleObject) return alert('No role selected to be created.')
            socket.emit('add-role', this.addRoleObject)
        },
        updateRole: function () {
            if (!this.editRole) return alert('No role selected to be updated.')
            socket.emit('update-role', this.editRole)
        },
        deleteRole: function () {
            if (!this.deleteRoleId) return alert('No role selected to be deleted.')
            socket.emit('delete-role', this.deleteRoleId)
        }
    },
    computed: {
        filteredRoles: function () {
            if (!this.roles || this.roles.length === 0) return []

            // Sort list by role importance -> role name
            return this.roles.sort((a, b) => {
                if (a.permissions.importance && b.permissions.importance) {
                    if (a.permissions.importance < b.permissions.importance) return -1
                    else if (a.permissions.importance > b.permissions.importance) return 1
                } else if (!a.permissions.importance && b.permissions.importance) return 1
                else if (!b.permissions.importance && a.permissions.importance) return -1

                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
                else if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
                return 0
            })
        },
        paginatedRoles: function () {
            return this.filteredRoles.slice(0, this.listSize)
        }
    },
    watch: {
        'editRole.permissions': {
            immediate: true,
            handler () { if (!this.editRole.permissions) this.editRole.permissions = {} }
        }
    },
    created () {
        this.listSize = this.initSize

        socket.on('send-message', msg => alert(msg))
        socket.on('send-error', msg => {
            console.error(msg)
            alert(msg)
        })

        socket.on('get-roles', () => socket.emit('get-roles'))
        socket.on('set-roles', roles => { this.roles = roles })
        socket.on('add-role', () => {
            this.$refs.addRole.close()
            this.addRoleObject = {}
        })
        socket.on('update-role', () => this.$refs.editRole.close())
        socket.on('delete-role', () => this.$refs.deleteRole.close())

        socket.emit('get-roles')
    }
})
