import BaseLogin from './BaseLogin'
import BaseLoginLogic from './BaseLoginLogic'

import { use, registerComponent } from '../../utils/plugins'

const Plugin = {
    install(Vue) {
        registerComponent(Vue, BaseLogin)
        registerComponent(Vue, BaseLoginLogic)
    }
}

use(Plugin)

export default Plugin

export {
    BaseLogin,
    BaseLoginLogic
}
