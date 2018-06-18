<script>
import axios from 'axios'
import BaseUrl from './BaseUrl.vue'
import Uris from './Uris.vue'
import HttpHandler from './HttpHandler.vue'

const baseUrl = BaseUrl.apiUrl
const uris = Uris.uris

function post(uri, argument, handler, interceptor) {
    var config = {
        timeout: 30000,
        baseURL: baseUrl,
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        }
    };
    var httpHandler = HttpHandler.create(handler);
    var http = axios.create(config);
    if(interceptor) {
        http.interceptors.response.use(interceptor, 
        function (error) {
            return Promise.reject(error);
        });
    }

    http.post(uri, argument).then(httpHandler.onResponse).catch(httpHandler.onError);
}

export default {
    uris,
    post
}
</script>
