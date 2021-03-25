<template>
    <div v-if="isLoginReady" :style="cssVars">
        <form @submit="onSubmitForm">
            <div class="login-container">
                <div class="login-element">
                    <template v-if="loginOptions.isAliasEmail">
                        <div class="label-container">
                            <label
                                for="usera"
                            ><b>{{
                                loginOptions.emailField.label
                            }}</b></label
                            >
                        </div>
                        <div class="input-container">
                            <span
                                :class="[
                                    loginOptions.iconLibrary,
                                    loginOptions.emailField.icon,
                                    'login-icon'
                                ]"
                            />
                            <input
                                ref="alias"
                                v-model="userAlias"
                                type="email"
                                :placeholder="
                                    loginOptions.emailField.placeholder
                                "
                                name="usera"
                                required
                            >
                        </div>
                    </template>
                    <template v-else>
                        <div class="label-container">
                            <label
                                for="usera"
                            ><b>{{
                                loginOptions.nameField.label
                            }}</b></label
                            >
                        </div>
                        <div class="input-container">
                            <i
                                :class="[
                                    loginOptions.iconLibrary,
                                    loginOptions.nameField.icon,
                                    'login-icon'
                                ]"
                            />
                            <input
                                v-model="userAlias"
                                type="text"
                                :placeholder="
                                    loginOptions.nameField.placeholder
                                "
                                name="usera"
                                required
                            >
                        </div>
                    </template>
                </div>
                <div class="login-element">
                    <div class="label-container">
                        <label
                            for="psw"
                        ><b>{{ loginOptions.passField.label }}</b></label
                        >
                    </div>
                    <div class="input-container">
                        <i
                            :class="[
                                loginOptions.iconLibrary,
                                loginOptions.passField.icon,
                                'login-icon'
                            ]"
                        />
                        <input
                            v-model="userPass"
                            type="password"
                            :placeholder="loginOptions.passField.placeholder"
                            name="psw"
                            required
                        >
                    </div>
                </div>
                <div v-if="displayError" class="login-element">
                    <label class="error-msg">{{ errorMsg }}</label>
                </div>
                <div class="login-element">
                    <button
                        :class="[
                            launchLogin ? 'login-submit__disabled' : '',
                            'login-submit'
                        ]"
                        type="submit"
                        :disabled="launchLogin"
                    >
                        Log In
                    </button>
                </div>
            </div>
        </form>
        <logic
            v-if="loginOptions.useLogic"
            :user-alias="userAlias"
            :user-password="userPass"
            :launch-login="launchLogin"
            :custom-options="loginOptions.logicConfig"
            @logic-success="onLogicSuccess"
            @logic-error="onLogicError"
        >/</logic
        >
    </div>
</template>
<script>
import _merge from 'lodash/merge'
import BaseLoginLogic from './BaseLoginLogic'
export default {
    name: 'BaseLogin',
    components: {
        [BaseLoginLogic.name]: BaseLoginLogic
    },
    props: {
        customOptions: {
            type: Object,
            required: false,
            default: () => {
                return {}
            }
        }
    },
    data() {
        return {
            loginOptions: {
                isAliasEmail: false,
                useLogic: false,
                logicConfig: {},
                displayErrorMsg: true,
                iconLibrary: 'mdi',
                ButtonStyle: {
                    fontColor: 'white',
                    color: '#4caf50'
                },
                emailField: {
                    icon: 'mdi-email',
                    label: 'Email',
                    placeholder: 'Enter Email'
                },
                nameField: {
                    icon: 'mdi-account',
                    label: 'Username',
                    placeholder: 'Enter Username'
                },
                passField: {
                    icon: 'mdi-lock-question',
                    label: 'Password',
                    placeholder: 'Enter Password'
                }
            },
            userAlias: '',
            userPass: '',
            launchLogin: false,
            isLoginReady: false,
            errorMsg: null
        }
    },
    computed: {
        displayError() {
            return this.loginOptions.displayErrorMsg && !!this.errorMsg
        },
        cssVars() {
            return {
                '--buttonFontColor': `${
                    this.loginOptions.ButtonStyle.fontColor
                }`,
                '--buttonColor': `${this.loginOptions.ButtonStyle.color}`
            }
        }
    },
    watch: {
        launchLogin: {
            handler: 'loginEmit'
        }
    },
    methods: {
        init() {
            if (this.customOptions !== null) {
                this.loginOptions = _merge(
                    this.loginOptions,
                    this.customOptions
                )
            }
            this.isLoginReady = true
            this.autofocusInput()
        },
        mergeOptions(target, source) {
            /// TODO: Base Component: replace this method for dependency lodash.merge?
            // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
            for (const key of Object.keys(source)) {
                if (source[key] instanceof Object && key in target) {
                    Object.assign(
                        source[key],
                        this.mergeOptions(target[key], source[key])
                    )
                }
            }
            // Join `target` and modified `source`
            Object.assign(target || {}, source)
            return target
        },
        autofocusInput() {
            this.$nextTick(() => {
                this.$refs.alias.focus()
            })
        },
        loginAction() {
            this.launchLogin = true
            this.errorMsg = null
        },
        loginEmit(isBusy) {
            this.$emit('login-state-change', isBusy)
            if (!isBusy) return
            if (this.loginOptions.useLogic) return
            this.onLogicSuccess({
                user: this.userAlias,
                pass: this.userPass
            })
        },
        onSubmitForm(e) {
            e.preventDefault()
            this.loginAction()
        },
        onLogicSuccess(data) {
            this.errorMsg = null
            this.launchLogin = false
            this.$emit('login-action', data)
        },
        onLogicError(err) {
            this.errorMsg = err.msg
            this.launchLogin = false
            this.$emit('login-error', err)
        }
    },
    mounted() {
        this.init()
    }
}
</script>
<style lang="scss" scoped>
.login-container {
    display: flex;
    flex-flow: column wrap;
    justify-content: center;
}

.error-msg {
    color: red;
    font-size: 80%;
}

.input-container {
    display: flex;
    flex-flow: row nowrap;
    width: 100%;
}
.login-icon {
    margin: 0.5rem 0;
    padding: 0.6rem;
    background: var(--buttonColor);
    color: var(--buttonFontColor);
    min-width: 50px;
    text-align: center;
}

.login-submit {
    &__disabled {
        border: 1px solid #999999;
        background-color: #cccccc;
        color: #666666;
        cursor: progress;
    }
}

/* Full-width input fields */
input[type="text"],
input[type="email"],
input[type="password"] {
    width: 100%;
    padding: 0.6rem 1.3rem;
    margin: 0.5rem 0;
    display: inline-block;
    border: 1px solid #ccc;
    box-sizing: border-box;
}

/* Set a style for all buttons */
button {
    background-color: var(--buttonColor);
    color: var(--buttonFontColor);
    padding: 0.8rem 2rem;
    margin: 0.5rem 0;
    border: none;
    font-weight: bolder;
    font-size: 100%;
    cursor: pointer;
    width: 100%;
}
</style>
