'use strict'
const Vue = window.Vue
const ROLE = window.role
const SOCKET = window.socket

// eslint-disable-next-line no-new
new Vue({
    el: 'main',
    data: {
        currentTab: 1,
        members: [],
        memberView: {},
        memberEdit: {},
        memberCount: 0,
        search: '',
        dropdowns: { role: { name: 'all', show: false } },
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
        clearInput: function (element) {
            if (element.target.id === 'search-member') this.search = ''
            else element.target.value = ''
        },
        addMember: function () {
            if (!ROLE.modify_members) return
            const userId = prompt("Enter user's Discord id.")
            const role = userId ? prompt('Enter role name.') : undefined
            if (role) SOCKET.emit('add-member', { userId, role })
        },
        deleteMember: function () {
            if (!ROLE.modify_members) return
            if (!this.memberEdit?.userId) return console.error('deleteMember(): User id in \'this.memberEdit\' doesn\'t exist.')
            SOCKET.emit('delete-member', this.memberEdit.userId)
        },
        updateMember: function (name) {
            if (!ROLE.modify_members) return
            if (!this.memberEdit?.userId) return console.error('updateMember(): User id in \'this.memberEdit\' doesn\'t exist.')
            SOCKET.emit('update-member', { userId: this.memberEdit.userId, name, value: this.memberEdit[name] })
        },
        openMemberView: function (id) {
            if (!ROLE.view_members) return
            SOCKET.emit('get-member-view', id)
            this.showMemberView = true
        },
        closeMemberView: function () {
            if (!ROLE.view_members) return
            const CONTAINER = document.querySelector('.content__members .member-details-view .container')
            if (CONTAINER) CONTAINER.scrollTop = 0
            setTimeout(() => { this.showMemberView = false }, 0)
        },
        openMemberEdit: function (id) {
            if (!ROLE.modify_members) return
            SOCKET.emit('get-member-edit', id)
            this.showMemberEdit = true
        },
        closeMemberEdit: function () {
            if (!ROLE.modify_members) return
            const CONTAINER = document.querySelector('.content__members .member-edit-view .container')
            if (CONTAINER) CONTAINER.scrollTop = 0
            setTimeout(() => { this.showMemberEdit = false }, 0)
        },
        createRelease: function () {
            if (!ROLE.create_releases) return
            const NUMBER = prompt('How many subscription licenses do you want to release?')
            if (NUMBER) SOCKET.emit('create-release', NUMBER)
        },
        deleteRelease: function () {
            if (!ROLE.create_releases) return
            SOCKET.emit('delete-release')
        },
        updateSetting: function (name) {
            if (!ROLE.edit_config) return
            SOCKET.emit('update-setting', { name, value: this.settings[name] })
        }
    },

    filters: {
        capitalize: value => { return value.replace(/\b\w/g, letter => letter.toUpperCase()) }
    },

    computed: {
        filteredMemberList: function () {
            if (!this.members || this.members.length === 0) return
            const members = this.members.filter(member => {
                // Filter members if username is included or if user id is exactly the same.
                return (
                    (
                        member.username.toLowerCase().includes(this.search.toLowerCase()) ||
                        member.userId === this.search
                    ) && (
                        this.dropdowns.role.name.toLowerCase() !== 'all'
                            ? member.role.name.toLowerCase() === this.dropdowns.role.name.toLowerCase()
                            : true
                    )
                )
            })

            // Sort list by role importance -> role name -> username
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
        currentTab: function () {
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
        },

        memberView: function () {
            // Modify username if length too long.
            if (!this.memberView.username) return
            setTimeout(() => {
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
            // Modify username if length too long.
            if (!this.memberEdit.username) return
            setTimeout(() => {
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

        // Modify variables if null.
        members: function () { if (!this.members) { this.members = [] } },
        showMemberView: function () { if (!this.showMemberView) { this.memberView = {} } },
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

        SOCKET.on('get-member-list', () => SOCKET.emit('get-member-list'))
        SOCKET.on('set-member-list', list => { this.members = list || []; usernameLengthMemberList() })

        if (ROLE.view_members) {
            SOCKET.on('set-member-view', data => { this.memberView = data || {} })
            SOCKET.on('close-member-view', () => this.closeMemberView())
            SOCKET.on('close-member-edit', () => this.closeMemberEdit())
        }

        if (ROLE.modify_members) {
            SOCKET.on('get-member-edit', () => SOCKET.emit('get-member-edit'))
            SOCKET.on('set-member-edit', data => { this.memberEdit = data || {} })
        }

        if (ROLE.create_releases) {
            SOCKET.on('get-release', () => SOCKET.emit('get-release'))
            SOCKET.on('set-release', data => { this.release = data || {} })
        }

        if (ROLE.view_console) {
            const CONTENT = document.querySelector('.content > div.content__console')

            SOCKET.on('get-logs', () => SOCKET.emit('get-logs'))
            SOCKET.on('send-logs', data => {
                this.logs = data || []
                CONTENT.scrollTop = CONTENT.scrollHeight
            })
        }

        if (ROLE.edit_config) {
            SOCKET.on('get-settings', () => SOCKET.emit('get-settings'))
            SOCKET.on('set-settings', data => { this.settings = data || {} })
        }

        // Emit socket events on startup.
        const EMITS = [SOCKET.emit('get-member-list')]
        if (ROLE?.create_releases) EMITS.push(SOCKET.emit('get-release'))
        if (ROLE?.view_console) EMITS.push(SOCKET.emit('get-logs'))
        if (ROLE?.edit_config) EMITS.push(SOCKET.emit('get-settings'))
        Promise.all([EMITS]).then(() => {
            usernameLengthMemberList()
            fadeOutLoader()
        }).catch(console.error)
    }
})

// Fade out screen loader.
const fadeOutLoader = () => {
    const loaderStyle = document.getElementsByClassName('loader')[0].style

    loaderStyle.opacity = (1).toString();
    (function fade () {
        (loaderStyle.opacity -= (0.08).toString()) < 0
            ? loaderStyle.display = 'none'
            : setTimeout(fade, 40)
    })()
}

// Modify member list's usernames if length too long.
const usernameLengthMemberList = () => {
    const USERNAMES = document.querySelectorAll('.content__members .member span')

    for (const username of USERNAMES) {
        let firstLoop = true
        const usernameLoop = () => {
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
    }
}