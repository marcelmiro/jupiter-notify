'use strict'
const socket = window.socket

// eslint-disable-next-line no-new
new window.Vue({
    el: 'main',
    data: {
        search: '',
        role: '',
        roles: [],
        members: [],
        currencies: [],
        pageSize: 6,
        pageNumber: 0,
        addMemberObject: {},
        dbMember: {}
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
        openMemberPage: function (userId) {
            if (userId) window.location.href = '/admin/members/' + userId
        },
        addMember: async function () {
            if (!this.addMemberObject) return alert('No member selected to be added.')
            socket.emit('add-member', this.addMemberObject)
        },
        getDbMember: function () {
            if (!this.search) return alert('Value to search in database doesn\'t exist.')
            socket.emit('get-db-member', this.search)
        }
    },
    computed: {
        roleNames: function () {
            return this.roles.map(role => role.name)
        },
        filteredMembers: function () {
            if (!this.members || this.members.length === 0) return []
            const members = this.members.filter(member => {
                return (
                    (
                        member.username.toLowerCase().includes(this.search.toLowerCase()) ||
                        member.userId === this.search ||
                        member.email.toLowerCase() === this.search.toLowerCase() ||
                        member.stripeId.toLowerCase() === this.search.toLowerCase()
                    ) && (
                        this.role.toLowerCase() !== 'all'
                            ? member.role.name.toLowerCase() === this.role.toLowerCase()
                            : true
                    )
                )
            })

            // Sort list by role importance -> role name -> username
            return members.sort((a, b) => {
                if (a.role.importance && b.role.importance) {
                    if (a.role.importance < b.role.importance) return -1
                    else if (a.role.importance > b.role.importance) return 1
                } else if (!a.role.importance && b.role.importance) return 1
                else if (!b.role.importance && a.role.importance) return -1

                if (a.role.name.toLowerCase() < b.role.name.toLowerCase()) return -1
                else if (a.role.name.toLowerCase() > b.role.name.toLowerCase()) return 1

                if (a.username.toLowerCase() < b.username.toLowerCase()) return -1
                else if (a.username.toLowerCase() > b.username.toLowerCase()) return 1
                return 0
            })
        },
        pageCount: function () {
            if (this.pageSize <= 0 || !this.filteredMembers) return 0
            return Math.ceil(this.filteredMembers.length / this.pageSize)
        },
        paginatedMembers: function () {
            if (this.pageSize <= 0) return []
            if (this.pageNumber < 0) this.pageNumber = 0
            if (this.pageCount > 0 && this.pageNumber > this.pageCount - 1) this.pageNumber = this.pageCount - 1
            const start = this.pageNumber * this.pageSize
            const end = start + this.pageSize
            return this.filteredMembers.slice(start, end)
        },
        paginationRange: function () {
            return Array.from(new Set([0, this.pageNumber, this.pageCount - 1])).filter(n => n >= 0)
        }
    },
    watch: {
        search: function () { this.pageNumber = 0 },
        role: function () { this.pageNumber = 0 },
        members: {
            immediate: true,
            handler () {
                // if (this.members) this.members.forEach(member => { member.avatarUrl += '.jpg' })
                if (this.members) {
                    this.members.forEach(member => {
                        if (!member.avatarUrl) member.avatarUrl = 'https://cdn.discordapp.com/embed/avatars/1.png'
                        else if (!member.avatarUrl.includes('.jpg') || !member.avatarUrl.includes('.png')) {
                            member.avatarUrl = member.avatarUrl.includes('?size=')
                                ? member.avatarUrl.slice(0, member.avatarUrl.indexOf('?size=')) + '.jpg' +
                                    member.avatarUrl.slice(member.avatarUrl.indexOf('?size='))
                                : member.avatarUrl + '.jpg'
                        }
                    })
                } else this.members = []
            }
        },
        dbMember: function () {
            if (this.dbMember && this.dbMember.userId) this.$refs.dbMember.open()
            else if (!this.dbMember) this.dbMember = {}
        },
        'addMemberObject.role': function () {
            const role = this.roles.find(role => role.name === this.addMemberObject.role)
            this.currencies = role ? role.subscription : []
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

        socket.on('get-members', () => socket.emit('get-members'))
        socket.on('set-members', members => { this.members = members })
        socket.on('set-db-member', member => { this.dbMember = member })
        socket.on('add-member', () => {
            this.$refs.addMember.close()
            this.addMemberObject = {}
        })

        socket.emit('get-members')
    }
})
