// AppComponent.vue

<template>
   <el-container>
        <el-header height="35px">
          <div>
            <span><i class="el-icon-document"></i>{{platform}}接口文档</span>
            <span>{{version}}</span>
          </div>
        </el-header>
        <el-main>
          <el-container>
            <el-aside class="left">
              <el-input placeholder="输入关键字进行过滤" v-model="catalogFilter"></el-input>
              <el-tree ref="catalogTree" 
                class="filter-tree" 
                :data="catalogs" 
                :props="catalogProps" 
                :highlight-current="true"
                :default-expand-all="true"
                :filter-node-method="filterCatalogNode" 
                @node-click="onCatalogNodeClick">
                <span class="custom-tree-node" slot-scope="{ node, data }">
                  <span v-if="data.type === 0" class="tree-node">
                    <span class="tree-node-catalog">
                      <i class="el-icon-menu"></i>
                      <span>{{data.name}}</span>
                    </span>
                  </span>
                  <span v-if="data.type === 1" class="tree-node">                    
                    <span class="tree-node-function">
                      <i class="el-icon-view"></i>
                      <span>{{data.name}}</span>
                    </span>
                  </span>
                </span>
              </el-tree>
            </el-aside>
            <el-main class="main">
              <functionComponent ref="functionPanel"/>
            </el-main>
          </el-container>
        </el-main>
    </el-container>
</template>

<script>
    import Component from 'vue-class-component'
    import BaseComponent from './BaseComponent.vue'
    import FunctionComponent from './FunctionComponent.vue'

    @Component({
      components: {
        functionComponent: FunctionComponent
      },
      props: {

      },
      watch: {
        'catalogFilter': {
          handler: 'onCatalogFilterChanged'
        }
      }
    })
    export default class Index extends BaseComponent {
      platform = ""
      version = ""
      catalogs = []
      catalogProps = {
        children: 'children',
        label: 'name'
      }

      catalogFilter = ""
      filterCatalogNode(value, data) {
        if (!value) {
          return true;
        }

        if (data.name.indexOf(value) !== -1) {
          return true
        }

        return data.keywords.indexOf(value) !== -1;
      }
      onCatalogFilterChanged(newVal, oldVal) {
        this.$refs.catalogTree.filter(newVal);
      }

      onCatalogNodeClick(data) {
        if(this.isNotNullOrEmpty(data.id)) {
          this.$refs.functionPanel.show(data.id);
        }        
      }

      onGetSysInfo(code, err, data) {
        if (code === 0) {
          this.platform = data.name
          this.version = data.backVersion
        }
        else {
          this.error(err.summary);
        }
      }
      getSysInfo() {
        this.post(this.network.uris.authSysInfo, null, this.onGetSysInfo);
      }

      onGetCatalog(code, err, data) {
        if (code === 0) {
          this.catalogs = data
        }
        else {
          this.error(err.summary);
        }
      }
      getCatalog() {
        this.post(this.network.uris.getCatalogTree, null, this.onGetCatalog);
      }

      mounted() {
        this.getSysInfo();
        this.getCatalog();
      }
    }
</script>

<style scoped lang="scss">
  .el-container {
    padding: 0;
  }

  .el-header {
    color: #333;
    text-align: left;
    padding: 5px;
    font-size: 20px;
  }  
  
  .el-aside {
    color: rgb(51, 51, 51);
    text-align: left;
    font-size: 18px;
    padding: 0;
  }
  
  .el-main {
    color: rgb(51, 51, 51);
    text-align: left;
    padding: 0;
  }

  .left {
    padding-right: 10px;
  }

  .main {
    padding-left: 20px;
    padding-right: 10px;    
  }

  .tree-node-catalog {
    font-size: medium;
  }
  .tree-node-function {
    font-size: small;
    //font-weight: bold;
    //font-style: italic;
  }

</style>