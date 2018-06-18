// AppComponent.vue

<template>
   <div class="container">
        <div>
            <el-input v-model="url" placeholder="">
                <template slot="prepend">{{method}}</template>
                <el-button slot="append" @click="send" :disabled="isSending">
                    <span class="btn-send">发送</span>
                </el-button>
            </el-input>
        </div>
        <div v-loading="isSending" 
            element-loading-text="发送中" 
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.5)">
            <div>
                <el-tabs v-model="inputTab" tabPosition="top">
                <el-tab-pane label="header" name="tpInputHeader">
                    <span slot="label">
                        <span>header</span>
                        <el-badge slot="label" :value="inputHeaders.length" :hidden="inputHeaders.length === 0" class="item"/>
                    </span>
                    <div v-for="(header, index) in inputHeaders" :key="index">
                        <el-input size="small" :placeholder="header.note" v-model="header.defaultValue">
                            <template slot="prepend">
                                <span v-if="header.required" class="model-key qurey-label qurey-required">{{header.name}}</span>
                                <span v-else class="model-key qurey-label qurey-optional">{{header.name}}</span>
                                </template>  
                                <el-button slot="append" v-if="header.name === 'token'" @click="showTokenDialog">
                                    <span class="btn-send">去创建一个凭证</span>
                                </el-button>                         
                        </el-input>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="query" name="tpInputQuery">
                    <span slot="label">
                        <span>query</span>
                        <el-badge slot="label" :value="inputQueries.length" :hidden="inputQueries.length === 0" class="item"/>
                    </span>
                    <div v-for="(query, index) in inputQueries" :key="index">
                        <el-input size="small" :placeholder="query.note" v-model="query.defaultValue">
                            <template slot="prepend">
                                <span v-if="query.required" class="model-key qurey-label qurey-required">{{query.name}}</span>
                                <span v-else class="model-key qurey-label qurey-optional">{{query.name}}</span>
                                </template>                           
                        </el-input>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="body" name="tpInputBody">
                    <vueJsonEditor v-if="isJsonInput" v-model="inputBodyJson" :showBtns="false" class="input-body-json">
                    </vueJsonEditor>
                    <el-input v-else v-model="inputBody" type="textarea" :autosize="{ minRows: 4, maxRows: 12}"  placeholder="" class="input-body">
                    </el-input>
                </el-tab-pane>
            </el-tabs>
            </div>
            <div >
                <el-tabs value="tpOutputBody" tabPosition="top">
                <el-tab-pane label="body" name="tpOutputBody">
                    <pre ref="outputBody"></pre>
                </el-tab-pane>
                <el-tab-pane label="header" name="tpOutputHeader">
                    <span slot="label">
                        <span>header</span>
                        <el-badge slot="label" :value="outputHeaders.length" :hidden="outputHeaders.length === 0" class="item"/>
                    </span>
                    <div v-for="(header, index) in outputHeaders" :key="index">
                        <span class="header-label">{{header.name}}</span>
                            <span>&nbsp;→&nbsp;</span>
                            <span >{{header.value}}</span>
                    </div>
                </el-tab-pane>
            </el-tabs>
            </div>
        </div>

        <el-dialog :visible.sync="tokenDialogVisible"
            :modal-append-to-body="false"
            :before-close="onTokenDialogClose"
            title="创建用户凭证"
            width="30%">

            <el-input v-model="account" placeholder="请输入账号" style="margin: 3px;" clearable>
                <template slot="prepend">账号</template>
                    <el-button slot="append" @click="createToken" :disabled="account === ''">
                        <span class="btn-send">创建</span>
                    </el-button>
            </el-input>
            <div style="padding: 3px;">
                <pre ref="tokenResult"></pre>
            </div>
        </el-dialog>
   </div>
</template>

<script>
    import axios from 'axios'
    import Component from 'vue-class-component'
    import VueJsonEditor from 'vue-json-editor'
    import BaseComponent from './BaseComponent.vue'

    @Component({
        props: {
            funId: {
                type: String,
                default: ""
            },
        },
        components: {
            vueJsonEditor: VueJsonEditor
        }
    })
    export default class TryIt extends BaseComponent {
        tokenDialogVisible = false
        isSending = false
        isJsonInput = false;
        url = ""
        method = ""
        inputTab = "tpInputBody"
        inputBody = ""
        inputQueries = new Array();
        inputHeaders = new Array();
        outputHeaders = new Array();
        account = ""
        inputBodyJson = {}

        showTokenDialog() {
            this.account = "";
            this.tokenDialogVisible = true;
        }
        onTokenDialogClose(done) {
            this.$refs.tokenResult.innerHTML = "";
            done();
        }
        onCreateToken(code, err, data) {
            if (code === 0) {
                this.$refs.tokenResult.innerHTML = this.syntaxHighlight(data);
                var headerCount = this.inputHeaders.length;
                for(var i = 0; i < headerCount; i++) {
                    if(this.inputHeaders[i].name === "token") {
                        this.inputHeaders[i].defaultValue = data.token;
                        break;
                    }
                }
            }
            else {
                this.error(err.summary + ": " + err.detail);
            }
        }
        createToken() {
            var filter = {
                account: this.account
            };
            this.post(this.network.uris.createToken, filter, this.onCreateToken);
        }

        onSendSuccess(response) {
            this.isSending = false;
            var isJson = false;
            var headers = new Array();
            if(response.headers) {
                for(var k in response.headers) {
                    var v = response.headers[k];
                    headers.push({name: k, value: v});  
                    if(k === "content-type") {
                        if(this.isNotNullOrEmpty(v)) {
                            if(v.indexOf("application/json") !== -1) {
                                isJson = true;
                            }
                        }
                    }
                }
            }
            this.outputHeaders = headers;

            if(isJson) {
                this.$refs.outputBody.innerHTML = this.syntaxHighlight(response.data);
            }
            else {
                this.$refs.outputBody.innerHTML = response.data;
            }            
        }
        onSendFail(err) {
            this.isSending = false;
            this.$refs.outputBody.innerHTML = err.message;
        }
        send() {
            var isJson = false;
            var headers = new Object();      
            if(this.inputHeaders) {
                var count = this.inputHeaders.length;
                for(var i = 0; i < count; i++) {
                    var header = this.inputHeaders[i];
                    if(header.required) {
                        if(this.isNullOrEmpty(header.defaultValue)) {
                            this.error("header -> '" + header.name + "' 必填");
                            this.inputTab = "tpInputHeader";
                            return
                        }
                    }
                    headers[header.name] = header.defaultValue;

                    if(header.name.toLowerCase() === "content-type") {
                        if(this.isNotNullOrEmpty(header.defaultValue)) {
                            if(header.defaultValue.toLowerCase().indexOf("json") !== -1) {
                                isJson = true;
                            }
                        }
                    }
                }
            }

            var params = new Object();
            if(this.inputQueries) {
                var count = this.inputQueries.length;
                for(var i = 0; i < count; i++) {
                    var query = this.inputQueries[i];
                    if(query.required) {
                        if(this.isNullOrEmpty(query.defaultValue)) {
                            this.error("query -> '" + query.name + "' 必填");
                            this.inputTab = "tpInputQuery";
                            return
                        }
                    }
                    params[query.name] = query.defaultValue;
                }
            }

            var data;
            try {
                // if(isJson) {
                //     if(this.isNotNullOrEmpty(this.inputBody)) {
                //         var json = JSON.parse(this.inputBody); 
                //         data = json;
                //     }
                //     else {
                //         data = {};
                //     }
                // }
                if (isJson) {
                    data = this.inputBodyJson;
                }
                else {
                    data = this.inputBody;
                }                
            }
            catch(e) {
                this.error(e.message);
                this.inputTab = "tpInputBody";
                return;
            }

            var config = {
                timeout: 30000,
                method: this.method,
                url: this.url,
                headers: headers,
                params: params,
                data: data
            };

            this.isSending = true;
            axios.request(config).then(this.onSendSuccess).catch(this.onSendFail);
        }

        onGetFunction(code, err, data) {
            if (code === 0) {
                this.url = data.fullPath;
                this.method = data.method;
                if(data.inputSample) {
                    //this.inputBody = JSON.stringify(data.inputSample, undefined, 4);
                    this.inputBodyJson = data.inputSample;
                }
                this.inputQueries = data.inputQueries;
                this.inputHeaders = data.inputHeaders;

                this.isJsonInput = false;
                if(this.inputHeaders) {
                    var count = this.inputHeaders.length;
                    for(var i = 0; i < count; i++) {
                        var header = this.inputHeaders[i];
                        if(header.name.toLowerCase() === "content-type") {
                            if(this.isNotNullOrEmpty(header.defaultValue)) {
                                if(header.defaultValue.toLowerCase().indexOf("json") !== -1) {
                                    this.isJsonInput = true;
                                }
                            }
                        }
                    }
                }
            }
            else {
                this.error(err.summary + ": " + err.detail);
            }
        }
        getFunction(id) {
            var uri = this.network.uris.getFunction + id
            this.post(uri, null, this.onGetFunction);
        }

        mounted() {
            this.getFunction(this.funId);
        }
    }
</script>

<style scoped lang="scss">
    .container {
        padding-top: 10px;
    }

    .input-body {
        margin-top: 2px;
    }
    .input-body-json {
        margin-top: 0;        
    }
    .header-label {
        font-weight: bold;
    }
    .header-required, 
    .qurey-required {
        color: red;        
    }    
    .qurey-label {
        display: inline-block;
        width: 120px;
        align-content: right;
        text-align: right;
    }
    .btn-send,
    .header-optional,
    .qurey-optional {        
        color: #000;
    }
    pre {        
        padding: 0px 10px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
</style>