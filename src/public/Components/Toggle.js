'use strict'
window.Vue.component('toggle', {
    props: {
        value: [Boolean, String],
        outputType: String,
        disabled: [Boolean, String]
    },
    data: function () {
        return {
            localValue: false,
            outputAsString: this.outputType && this.outputType.toLowerCase() === 'string'
        }
    },
    template: `
        <div class="toggle" :class="{ active: localValue }" @click="$emit('click')">
            <label>
              <input
                  type="checkbox"
                  v-model="localValue"
                  :disabled="disabled && disabled.toString().toLowerCase() === 'true'">
            </label>
        </div>
    `,
    watch: {
        value: {
            immediate: true,
            handler () {
                this.localValue = Boolean(
                    this.value &&
                    this.value.toString().toLowerCase() === 'true'
                )
            }
        },
        localValue: {
            immediate: true,
            handler () {
                this.$emit(
                    'input',
                    this.outputAsString ? this.localValue.toString() : this.localValue
                )
            }
        }
    }
})
