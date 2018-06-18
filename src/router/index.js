import Vue from 'vue'
import Router from 'vue-router'
import Index from '../components/Index.vue'
import TryIt from '../components/TryIt.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/tryit/:funId',
      name: 'TryIt',
      component: TryIt,
      props: true
    }
  ]
})
