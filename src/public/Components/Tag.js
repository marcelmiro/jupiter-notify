'use strict'
window.Vue.component('tag', {
    props: {
        text: String,
        backgroundColor: String
    },
    template: `
        <div class="tag" :style="{ backgroundColor: computedBackgroundColor, color: getColor() }">
            <span>{{ text }}</span>
        </div>
    `,
    methods: {
        getColor: function () {
            const color = this.computedBackgroundColor.replace('#', '')
            const red = parseInt(color.substr(0, 2), 16)
            const green = parseInt(color.substr(2, 2), 16)
            const blue = parseInt(color.substr(4, 2), 16)
            const YIQ = ((red * 299) + (green * 587) + (blue * 114)) / 1000
            return YIQ >= 190 ? '#000000' : '#FFFFFF'
        }
    },
    computed: {
        computedBackgroundColor: function () {
            if (!this.backgroundColor) return '#555555'
            return '#' + this.backgroundColor.replace('#', '').slice(0, 6)
        }
    }
})
