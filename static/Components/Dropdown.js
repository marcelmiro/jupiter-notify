'use strict'
window.Vue.component('Dropdown', {
    props: {
        items: { type: Array, required: true },
        value: [String]
    },
    data: function () {
        return {
            localValue: this.value && this.items.includes(this.value)
                ? this.value
                : this.items[0],
            active: false
        }
    },
    template: `
        <div
            class="dropdown"
            :class="{ active }"
            tabindex="0"
            @focusout="focusOut"
        >
            <button @click="active = !active">
                <span>{{ localValue }}</span>
                <img src="/assets/arrow_head.svg" alt="Arrow">
            </button>
            <transition name="dropdown-animation">
              <div class="dropdown__content" v-if="active">
                <label v-for="item in items" @click="active = false">
                  <span>{{ item }}</span>
                  <input
                      type="radio"
                      v-model="localValue"
                      :value="item"
                  >
                  <img src="/assets/arrow_head.svg" alt="Arrow">
                </label>
              </div>
            </transition>
        </div>
    `,
    methods: {
        focusOut: function (event) {
            if (
                !event ||
                !event.currentTarget ||
                !event.relatedTarget ||
                !event.currentTarget.contains(event.relatedTarget)
            ) this.active = false
        }
    },
    watch: {
        localValue: {
            immediate: true,
            handler () { this.$emit('input', this.localValue) }
        },
        items: function () {
            this.localValue = this.value && this.items.includes(this.value)
                ? this.value
                : this.items[0]
        }
    }
})
