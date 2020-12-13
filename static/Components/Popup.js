'use strict'
window.Vue.component('Popup', {
    props: { show: [Boolean, String] },
    data: function () {
        return {
            localShow: this.show && this.show.toString().toLowerCase() === 'true'
        }
    },
    template: `
        <transition name="popup-animation">
            <div id="add-member" class="popup" v-if="localShow">
                <div class="overlay" @click="close"></div>
                <div class="popup__container">
                    <div class="popup__content">
                        <slot></slot>
                    </div>
                </div>
            </div>
        </transition>
    `,
    methods: {
        open: function () { this.localShow = true },
        close: function () { this.$emit('close'); this.localShow = false }
    }
})
