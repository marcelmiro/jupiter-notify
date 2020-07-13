new Vue({
    el: 'main',
    data: {
        currentTab: 1,
        members: [],
        memberView: {},
        memberEdit: {},
        memberCount: 0,
        search: '',
        dropdowns: {
            role: { name: 'all', show: false },
            subscription_currency: { name: 'EUR', show: false }
        },
        showMemberView: false,
        showMemberEdit: false,
        release: {},
        logs: [],
        settings: {}
    },

    methods: {
        refresh: function (content) {
            let button
            if (content === 'members') {
                SOCKET.emit('get-member-list')
                button = document.getElementById('refresh-members')
            } else if (content === 'release') {
                SOCKET.emit('get-release')
                button = document.getElementById('refresh-releases')
            }

            if (button) {
                button.classList.remove('animation')
                setTimeout(() => button.classList.add('animation'), 10)
            }
        },

        addMember: ROLE?.['modify_members'] ? function () {
            const userId = prompt("Enter user's Discord id.")
            const role = userId ? prompt('Enter role name.') : undefined
            if (role) SOCKET.emit('add-member', { userId, role })
        } : function () {},
        deleteMember: ROLE?.['modify_members'] ? function () {
            if (!this.memberEdit?.user?.userId) return console.error('deleteMember(): User id in \'this.memberEdit\' doesn\'t exist.')
            SOCKET.emit('delete-member', this.memberEdit.user.userId)
        } : function () {},
        updateMember: ROLE?.['modify_members'] ? function (name) {
            if (!this.memberEdit?.user?.userId) return console.error('updateMember(): User id in \'this.memberEdit\' doesn\'t exist.')

            const VALUE = this.memberEdit[name] || this.memberEdit.user[name] || this.memberEdit.subscription[name]
            return console.log('VALUE:', VALUE)
            SOCKET.emit('update-member', { name, value: this.memberEdit[name] })
        } : function () {},

        openMemberView: ROLE?.['view_members'] ? function (id) {
            SOCKET.emit('get-member-view', id)
            this.showMemberView = true
        } : function () {},
        closeMemberView: ROLE?.['view_members'] ? function () {
            const CONTAINER = document.querySelector('.content__members .member-details-view .container')
            if (CONTAINER) CONTAINER.scrollTop = 0
            setTimeout(function () { this.showMemberView = false }, 0)
        } : function () {},

        openMemberEdit: ROLE?.['modify_members'] ? function (id) {
            SOCKET.emit('get-member-edit', id)
            this.showMemberEdit = true
        } : function () {},
        closeMemberEdit: ROLE?.['modify_members'] ? function () {
            const CONTAINER = document.querySelector('.content__members .member-edit-view .container')
            if (CONTAINER) CONTAINER.scrollTop = 0
            setTimeout(function () { this.showMemberEdit = false }, 0)
        } : function () {},

        createRelease: ROLE?.['create_releases'] ? function () {
            const NUMBER = prompt('How many renewal licenses do you want to release?')
            if (NUMBER) SOCKET.emit('create-release', NUMBER)
        } : function () {},
        deleteRelease: ROLE?.['create_releases'] ? function () {
            SOCKET.emit('delete-release')
        } : function () {},

        updateSetting: ROLE?.['edit_config'] ? function (name) {
            SOCKET.emit('update-setting', { name, value: this.settings[name] })
        } : function () {}
    },

    filters: {
        capitalize: value => { return value.replace(/\b\w/g, letter => letter.toUpperCase()) }
    },

    computed: {
        filteredMemberList: function () {
            if (!this.members) return
            const members = this.members.filter(function (member) {
                return (
                    member.username.toLowerCase().includes(this.search.toLowerCase()) &&
                    (this.dropdowns.role.name.toLowerCase() !== 'all' ? member.role.name.toLowerCase() === this.dropdowns.role.name.toLowerCase() : true)
                )
            })

            members.sort((a, b) => {
                if (a.role.importance < b.role.importance) return -1
                else if (a.role.importance > b.role.importance) return 1

                if (a.role.name.toLowerCase() < b.role.name.toLowerCase()) return -1
                else if (a.role.name.toLowerCase() > b.role.name.toLowerCase()) return 1

                return a.username.toLowerCase() < b.username.toLowerCase()
                    ? -1
                    : a.username.toLowerCase() > b.username.toLowerCase()
                        ? 1
                        : 0
            })

            this.memberCount = members.length
            return members
        }
    },

    watch: {
        currentTab: {
            immediate: true,
            handler () {
                const TABS = document.querySelectorAll('.tabs-container .tab')
                const CONTENTS = document.querySelectorAll('.content > div')

                switch (this.currentTab) {
                case 1:
                    SOCKET.emit('get-member-list')
                    break
                case 2:
                    SOCKET.emit('get-release')
                    break
                case 3:
                    SOCKET.emit('get-logs')
                    break
                case 4:
                    SOCKET.emit('get-settings')
                    break
                default:
                    console.error('currentTab(): Tab not found.')
                }

                TABS.forEach(tab => { tab.classList.remove('active') })
                CONTENTS.forEach(content => { content.classList.remove('active') })

                TABS[this.currentTab - 1].querySelector('input').checked = true
                TABS[this.currentTab - 1].classList.add('active')
                CONTENTS[this.currentTab - 1].classList.add('active')
                if (CONTENTS[this.currentTab - 1].classList.contains('content__console')) {
                    CONTENTS[this.currentTab - 1].scrollTop = CONTENTS[this.currentTab - 1].scrollHeight
                }
            }
        },

        'dropdowns.role.name': function () { this.dropdowns.role.show = false },

        memberView: function () {
            if (!this.memberView.username) return
            setTimeout(function () {
                const username = document.querySelector('.content__members .member-details-view .container h2')
                let firstLoop = true
                const usernameLoop = () => {
                    if (username.offsetWidth + 10 >= 500) {
                        if (firstLoop) {
                            firstLoop = false
                            username.textContent += '...'
                        }
                        username.textContent = username.textContent.slice(0, -4) + username.textContent.slice(-3)
                        usernameLoop()
                    }
                }
                usernameLoop()
            }, 0)
        },
        memberEdit: function () {
            if (!this.memberEdit.username) return
            setTimeout(function () {
                const username = document.querySelector('.content__members .member-edit-view .container h2')
                let firstLoop = true
                const usernameLoop = () => {
                    if (username.offsetWidth + 10 >= 500) {
                        if (firstLoop) {
                            firstLoop = false
                            username.textContent += '...'
                        }
                        username.textContent = username.textContent.slice(0, -4) + username.textContent.slice(-3)
                        usernameLoop()
                    }
                }
                usernameLoop()
            }, 0)
        },
        'memberEdit.subscription_currency': function () { this.dropdowns.subscription_currency.show = false },

        members: function () { if (!this.members) { this.members = [] } },
        showMemberView: function () { console.log('showMemberView'); if (!this.showMemberView) { this.memberView = {} } },
        showMemberEdit: function () { if (!this.showMemberEdit) { this.memberEdit = {} } },
        release: function () { if (!this.release) { this.release = {} } },
        logs: function () { if (!this.logs) { this.logs = [] } }
    },

    mounted: function () {
        SOCKET.on('logout', () => { window.location.href = '/' })
        SOCKET.on('send-message', msg => alert(msg))
        SOCKET.on('send-error', msg => {
            console.error(msg)
            alert(msg)
        })

        SOCKET.on('get-member-list', function () { SOCKET.emit('get-member-list') })
        SOCKET.on('set-member-list', function (list) { this.members = list || []; lengthManager() })

        if (ROLE?.['view_members']) {
            SOCKET.on('set-member-view', function (data) { this.memberView = data || {} })
            SOCKET.on('close-member-view', function () { this.closeMemberView() })
        }

        if (ROLE?.['modify_members']) {
            SOCKET.on('get-member-edit', function () { SOCKET.emit('get-member-edit') })
            SOCKET.on('set-member-edit', function (data) { this.memberEdit = data || {} })
        }

        if (ROLE?.['create_releases']) {
            SOCKET.on('get-release', function () { SOCKET.emit('get-release') })
            SOCKET.on('set-release', function (data) { this.release = data || {} })
        }

        if (ROLE?.['view_console']) {
            const CONTENT = document.querySelector('.content > div.content__console')
            SOCKET.on('get-logs', function () { SOCKET.emit('get-logs') })
            SOCKET.on('send-logs', function (data) {
                this.logs = data || []
                CONTENT.scrollTop = CONTENT.scrollHeight
            })
        }

        if (ROLE?.['edit_config']) {
            SOCKET.on('get-settings', function () { SOCKET.emit('get-settings') })
            SOCKET.on('set-settings', function (data) { this.settings = data || {} })
        }

        setTimeout(() => lengthManager(), 200)
    }
})

const lengthManager = () => {
    const USERNAMES = document.querySelectorAll('.content__members .member span')

    USERNAMES.forEach(username => {
        let firstLoop = true
        function usernameLoop () {
            if (username.offsetWidth + 10 >= 400) {
                if (firstLoop) {
                    firstLoop = false
                    username.textContent += '...'
                }
                username.textContent = username.textContent.slice(0, -4) + username.textContent.slice(-3)
                usernameLoop()
            }
        }
        usernameLoop()
    })
}
