<script>
import _merge from 'lodash/merge'
export default {
    name: 'BaseLoginLogic',
    props: {
        userAlias: {
            type: String,
            required: true,
            default() {
                return null
            }
        },
        userPassword: {
            type: String,
            required: true,
            default() {
                return null
            }
        },
        customOptions: {
            type: Object,
            required: false,
            default: () => {
                return null
            }
        },
        launchLogin: {
            type: Boolean,
            required: true,
            default() {
                return false
            }
        }
    },
    data() {
        return {
            isLoginBusy: false,
            isAwaitingResponse: false,
            loginLogicOptions: {
                loginLogicRequest: null,
                postResponseLogic: null
            },
            errorDictionary: {
                steps: ['generic', 'validator', 'request', 'postLogic'],
                states: [
                    'unknown',
                    'busy',
                    'userInvalid',
                    'passInvalid',
                    'requestFail',
                    'postLogicFail'
                ]
            }
        }
    },
    watch: {
        launchLogin(newValue) {
            if (newValue) this.login()
        }
    },
    methods: {
        init() {
            if (this.customOptions !== null) {
                this.loginLogicOptions = _merge(
                    this.loginLogicOptions,
                    this.customOptions
                )
            }
        },
        async login() {
            if (!this.simpleValidator()) return
            var dataResponse = await this.loginUser()
            this.launchSucess(dataResponse)
        },
        simpleValidator() {
            if (!this.userAlias.trim()) {
                this.launchError(1, 2, 'User alias is null or empty')
                return false
            }
            if (!this.userPassword.trim()) {
                this.launchError(1, 3, 'User password is null or empty')
                return false
            }
            if (this.isLoginBusy) {
                this.launchError(0, 1, 'Base Login Logic Component is busy')
                return false
            }
            return true
        },
        async loginUser() {
            try {
                this.isLoginBusy = true
                var rawRequest = await this.loginRequest()
                if (!this.loginLogicOptions.postResponseLogic) { return rawRequest }
                return this.postResponseLogic(rawRequest)
            } catch (err) {
                this.launchError(err.step, err.state, err.msg)
            } finally {
                this.isLoginBusy = false
            }
        },
        async loginRequest() {
            try {
                this.isAwaitingResponse = true
                const authenticatedUser = await this.loginLogicOptions.loginLogicRequest(
                    this.userAlias,
                    this.userPassword
                )
                return authenticatedUser
            } catch (err) {
                throw this.errorFactory(2, 4, err)
            } finally {
                this.isAwaitingResponse = false
            }
        },
        async postResponseLogic(rawRequest) {
            try {
                this.isProcesingResponse = true
                const dataProcessed = await this.loginLogicOptions.postResponseLogic(
                    this,
                    rawRequest
                )
                return dataProcessed
            } catch (err) {
                throw this.errorFactory(3, 5, err)
            } finally {
                this.isProcesingResponse = false
            }
        },
        launchSucess(data) {
            this.$emit('logic-success', data)
        },
        launchError(step, state, msg) {
            this.$emit('logic-error', this.errorFactory(step, state, msg))
        },
        errorFactory(step, state, msg) {
            return {
                step: this.errorDictionary.steps[step],
                state: this.errorDictionary.states[state],
                msg: msg
            }
        }
    },
    mounted() {
        this.init()
    },
    render: () => null
}
</script>
