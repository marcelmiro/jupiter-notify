'use strict'
const socket = window.socket

// eslint-disable-next-line no-new
new window.Vue({
    el: 'main',
    data: {
        config: '',
        settings: {},
        initialSettings: {},
        initSize: 10,
        listSize: 0
    },
    methods: {
        updateSettings: function () {
            socket.emit('update-settings', this.settings)
        }
    },
    computed: {
        settingNames: function () {
            return Object.keys(this.settings)
        },
        filteredSettings: function () {
            if (!this.config) this.config = 'general'
            const settings = this.settings ? this.settings[this.config.toLowerCase()] : undefined
            if (!settings) return []

            // Sort list by setting name
            return settings.sort((a, b) => {
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
                else if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
                else return 0
            })
        },
        paginatedSettings: function () {
            return this.filteredSettings.slice(0, this.listSize)
        },
        compareSettings: function () {
            if (!this.config) this.config = 'general'
            let initialSettings = this.initialSettings ? this.initialSettings[this.config.toLowerCase()] : undefined
            if (!initialSettings) return true

            initialSettings = initialSettings.sort((a, b) => {
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
                else if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
                else return 0
            })
            return JSON.stringify(this.filteredSettings) === JSON.stringify(initialSettings)
        }
    },
    watch: {
        config: function () { this.listSize = this.initSize }
    },
    created () {
        this.listSize = this.initSize

        socket.on('send-message', msg => alert(msg))
        socket.on('send-error', msg => {
            console.error(msg)
            alert(msg)
        })

        socket.on('get-settings', () => socket.emit('get-settings'))
        socket.on('set-settings', settings => {
            this.settings = settings
            this.initialSettings = JSON.parse(JSON.stringify(settings))
        })

        socket.emit('get-settings')
    }
})
