// index.js

import Vue from 'vue'
//import ElementUI from 'element-ui'
//import 'element-ui/lib/theme-chalk/index.css';
import {
  Message,
  Container,
  Header,
  Aside,
  Main,
  Input,
  Tree,
  Collapse,
  CollapseItem,
  Tabs,
  TabPane,
  Select,
  Option,
  Button,
  Badge,
  Loading,
  Dialog
} from 'element-ui'
import App from './App'
import router from './router'
import Network from './network/Network.vue'


//Vue.use(ElementUI)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Input)
Vue.use(Tree)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Select)
Vue.use(Option)
Vue.use(Button)
Vue.use(Badge)
Vue.use(Loading)
Vue.use(Dialog)

Vue.prototype.network = Network
Vue.prototype.$message = Message

 /* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})