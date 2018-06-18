// FunctionComponent.vue

<template>
   <el-collapse v-show="visible" v-model="activeItems">
       <el-collapse-item name="summary">
           <template slot="title">
               <span class="pnl-title">{{funcName}}</span>
               <span>&nbsp;&nbsp;</span>
               <el-button size="small" @click.stop="onTry">尝试一下</el-button>
           </template>
           <div>
               <span>方法:&nbsp;</span>
               <span class="item-value">{{funcMethod}}</span>
           </div>
           <div>
               <span>地址:&nbsp;</span>
               <span class="item-value">{{funcPath}}</span>
           </div>
           <div>
               <span>{{funcNote}}</span>
           </div>
       </el-collapse-item>
       <el-collapse-item name="output"> 
           <template slot="title">
               <span class="pnl-title">输出参数</span>
           </template>
           <el-tabs value="tpOutputBody" tabPosition="left">
               <el-tab-pane label="header" name="tpOutputHeader">
                   <div v-for="(header, index) in outputHeaders" :key="index">
                       <span>{{header.name}}</span>
                        <span>:&nbsp;</span>
                        <span class="item-value">{{header.defaultValue}}</span>
                   </div>
               </el-tab-pane>
               <el-tab-pane label="body" name="tpOutputBody">
                    <el-tabs value="tpOutputExample" tabPosition="right">
                        <el-tab-pane label="结构" name="tpOutputModel">
                            <div>
                                <div v-for="(model, index) in outputModels" :key="index">
                                    <span class="model-key">{{model.type}}&nbsp;{</span>                           
                                    <div>
                                        <div v-for="(child, index) in model.childs" :key="index">
                                            <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <span class="model-key">{{child.name}}</span>
                                            <span>(</span>
                                            <span class="model-type">{{child.type}}</span>
                                            <span>):&nbsp;</span>
                                            <span>{{child.note}}</span>
                                        </div>
                                    </div>
                                    <div class="model-key">}</div>
                                    <div>&nbsp;</div>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="示例" name="tpOutputExample">
                            <pre ref="codeOutputExampe"></pre>
                        </el-tab-pane>
                    </el-tabs>
               </el-tab-pane>
           </el-tabs>
       </el-collapse-item>
       <el-collapse-item name="intput"> 
           <template slot="title">
               <span class="pnl-title">输入参数</span>
           </template>
           <el-tabs value="tpInputBody" tabPosition="left">
               <el-tab-pane label="header" name="tpInputHeader">
                   <div v-for="(header, index) in inputHeaders" :key="index">
                       <span class="model-key header-lable">{{header.name}}</span>
                        <el-select size="mini" placeholder="" :value="header.defaultValue">
                            <el-option v-for="(item, index) in header.values" :key="index" :value="item">
                            </el-option>
                        </el-select>
                        <span>(</span>
                        <span v-if="header.required" class="model-required">必填</span>
                        <span v-else class="model-optional">可选</span>
                        <span>):&nbsp;</span>
                        <span>{{header.note}}</span>
                   </div>
               </el-tab-pane>
               <el-tab-pane label="query" name="tpInputQuery">
                   <div v-for="(query, index) in inputQueries" :key="index">
                       <span class="model-key header-lable">{{query.name}}</span>
                        <span>(</span>
                        <span v-if="query.required" class="model-required">必填</span>
                        <span v-else class="model-optional">可选</span>
                        <span>):&nbsp;</span>
                        <span>{{query.note}}</span>
                   </div>
               </el-tab-pane>
               <el-tab-pane label="body" name="tpInputBody">
                   <el-tabs value="tpInputExample" tabPosition="right">
                        <el-tab-pane label="结构" name="tpInputModel">
                            <div>
                                <div v-for="(model, index) in inputModels" :key="index">
                                    <span class="model-key">{{model.type}}&nbsp;{</span>                           
                                    <div>
                                        <div v-for="(child, index) in model.childs" :key="index">
                                            <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <span class="model-key">{{child.name}}</span>
                                            <span>(</span>
                                            <span class="model-type">{{child.type}}</span>
                                            <span v-if="child.required" class="model-required">, 必填</span>
                                            <span v-else class="model-optional">, 可选</span>
                                            <span>):&nbsp;</span>
                                            <span>{{child.note}}</span>
                                        </div>
                                    </div>
                                    <div class="model-key">}</div>
                                    <div>&nbsp;</div>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="示例" name="tpInputExample">
                            <pre ref="codeInputExampe" v-show="inputSampleVisible"></pre>
                        </el-tab-pane>
                    </el-tabs>
               </el-tab-pane>
           </el-tabs>
       </el-collapse-item>
   </el-collapse>
</template>

<script>
    import Component from 'vue-class-component'
    import BaseComponent from './BaseComponent.vue'

    @Component({
    })
    export default class FunctionComponent extends BaseComponent {
        id = ""
        visible = false
        inputSampleVisible = false
        activeItems = ["summary", "output", "intput"]

        funcName = ""
        funcMethod = ""
        funcPath = ""
        funcNote = ""
        outputModels = new Array();
        inputModels = new Array();
        inputHeaders = new Array();
        outputHeaders = new Array();
        inputQueries = new Array();

        show(id) {
            this.id = id;
            if (this.isNullOrEmpty(id)) {
                this.visible = false;
                return;
            }
            this.visible = true;
            this.getFunction(id);
        }

        fillFromChilds(childs, parent) {
            var count = parent.childs.length;
            for (var index = 0; index < count; ++index) {
                var child = parent.childs[index];
                if(child.childs.length < 1) {
                    continue
                }
                childs.push(child);
                this.fillFromChilds(childs, child);
            }
        }

        onTry() {
            this.$router.push({
                name: "TryIt",
                params: {funId: this.id},
            });
        }

        onGetFunction(code, err, data) {
            if (code === 0) {
                this.funcName = data.name;
                this.funcMethod = data.method;
                this.funcPath = data.path;
                this.funcNote = data.note;

                // output
                if(data.outputSample) {
                    this.$refs.codeOutputExampe.innerHTML = this.syntaxHighlight(data.outputSample);
                }
                else {
                    this.$refs.codeOutputExampe.innerHTML = "";
                }      
                var models = new Array();          
                if(data.outputModel) {
                    models.push(data.outputModel);
                    this.fillFromChilds(models, data.outputModel)
                }
                this.outputModels = models;
                this.outputHeaders = data.outputHeaders;

                // input
                if(data.inputSample) {
                    this.inputSampleVisible = true;
                    this.$refs.codeInputExampe.innerHTML = this.syntaxHighlight(data.inputSample);
                }
                else {
                    this.$refs.codeInputExampe.innerHTML = "";
                    this.inputSampleVisible = false;
                }    
                models = new Array();          
                if(data.inputModel) {
                    models.push(data.inputModel);
                    this.fillFromChilds(models, data.inputModel)
                }
                this.inputModels = models;
                this.inputHeaders = data.inputHeaders;
                this.inputQueries = data.inputQueries;
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
        }
    }
</script>

<style scoped lang="scss">
    .pnl-title {
        //font-weight: bold;
        font-size: 16px;
    }

    .item-value {
        font-weight: bold;
    }

    pre {outline: 1px solid #ccc; padding: 5px; margin: 2px; }
    
    .model-key {
        font-weight: bold;
    }
    .model-type {
        color: cornflowerblue;
    }
    .model-required {
        color: red;
        font-style: italic;
    }
    .model-optional {
        color: darkgray;
        font-style: italic;
    }
    .header-lable {
        display: inline-block;
        width: 120px;
        align-content: right;
        text-align: right;
    }

</style>