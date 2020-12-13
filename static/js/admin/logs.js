'use strict'
const socket = window.socket

// eslint-disable-next-line no-new
new window.Vue({
    el: 'main',
    data: {
        level: '',
        levelColors: {
            info: '#3FBF3F',
            warn: '#FFCC00',
            error: '#FF0000',
            fatal: '#9A63FF',
            default: '#FFFFFF'
        },
        logs: [],
        initSize: 12,
        listSize: 0
    },
    methods: {
        getLogColor: function (level) {
            return this.levelColors[level.toLowerCase()] || this.levelColors.default
        }
    },
    computed: {
        filteredLogs: function () {
            if (!this.logs || this.logs.length === 0) return []
            const logs = this.logs.filter(log => {
                return this.level.toLowerCase() !== 'all'
                    ? log.level.toLowerCase() === this.level.toLowerCase()
                    : true
            })

            // Sort list by log id -> log date
            return logs.sort((a, b) => {
                if (a.id < b.id) return 1
                else if (a.id > b.id) return -1

                if (a.created.toLowerCase() < b.created.toLowerCase()) return 1
                else if (a.created.toLowerCase() > b.created.toLowerCase()) return -1
                else return 0
            })
        },
        paginatedLogs: function () {
            return this.filteredLogs.slice(0, this.listSize)
        }
    },
    watch: {
        level: function () { this.listSize = this.initSize }
    },
    created () {
        this.listSize = this.initSize

        socket.on('send-message', msg => alert(msg))
        socket.on('send-error', msg => {
            console.error(msg)
            alert(msg)
        })

        socket.on('get-logs', () => socket.emit('get-logs'))
        socket.on('set-logs', logs => { this.logs = logs })

        socket.emit('get-logs')
    }
})
