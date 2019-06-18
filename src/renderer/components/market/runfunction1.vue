<template lang="pug">
    .runfunction
        h4 
            i.iconfont.icon-jiaoseguanli
            span 调用函数
        el-table(:data="functionData" ref="functionData" style="width: 100%" )
            el-table-column(prop="contractAddress" label="合约地址")

            el-table-column(prop="issuer" label="合约发行人")

            el-table-column(prop="className" label="类名")

            el-table-column(label="详情" width="100")
                template(slot-scope="scope")
                    el-button(type="primary" size="mini" @click="expandRow(scope.index,scope.row)") 查看详情

            el-table-column(type="expand" width="20")
                template(slot-scope="{ row, column, $index }")
                    el-table(:data="row.func" style="width: 100%" size="mini")

                        el-table-column(prop="name" label="方法名" width="150")

                        el-table-column(label="参数")
                            template(slot-scope="props")
                                .key_inp(v-for="(item,index3) in props.row.keys")
                                    .boo_inp(v-if="isTypeFit('boo',item.keytype)")
                                        .inpahead {{item.keyname}}
                                        el-switch(v-model="item.keyval" active-text="true" inactive-text="false")
                    
                                    .map_inp(v-if="isTypeFit('map',item.keytype)")
                                        .inpahead {{item.keyname}}Map

                                    .arr_inp(v-if="isTypeFit('arr',item.keytype)")
                                        .inpahead {{item.keyname}}
                                        el-tag.tags(v-for="(tag,taginx) in item.keyval" :key="taginx" @close="handleClose($index,props.$index,index3,tag)" closable :disable-transitions="false" size="small") {{tag}}
                                        el-input.input-new-tag(v-show="item.inputVisible" v-model="item.inputValue" size="small" :placeholder="TypeText(item.keytype)"
                                            :ref="item.keyname+$index+props.$index+index3" style="width:150px"
                                            @keyup.enter.native="handleInputConfirm($index,props.$index,index3)" @blur="handleInputConfirm($index,props.$index,index3)")
                                        el-button.button-new-tag(v-show="!item.inputVisible" size="mini"
                                             @click="showInput(item.keyname+$index+props.$index+index3,item)") + 添加值

                                    .str_inp(v-if="isTypeFit('str_num',item.keytype)")
                                        el-input(v-model="item.keyval" :placeholder="TypeText(item.keytype)" size="mini" style="margin:10px 0 5px;")
                                            i(slot="prepend") {{item.keyname}}

                        el-table-column(prop="returnType" label="返回类型")
            
                        el-table-column( label="操作" width="100")
                            template(slot-scope="props") 
                                el-button(type="primary" size="mini" @click="run($index,props.$index)") 执行

        el-pagination(class="elPage" background layout="prev, pager, next" :current-page='page' :total='count' :pageSize='10' @current-change='gopage')

</template>
<script>
import { getOrtherContract, contractInvoke } from '@/http/index.js'
    export default {
        name:'runfunction',
        data(){
            return {
                dataTimer:null,
                functionData:[],
                page:0,
                count:0,
                activeIndex: -1,//展开行下标
                activeRow:{},//展开行内容
            }
        },
        mounted(){
            this.getData();
        },
        destroyed() {
            if(this.dataTimer) clearTimeout(this.dataTimer);
        },
        methods:{
            // 展开
            expandRow(index,rowData) {
                let shouldOpen;
                // 关闭所有
                for (let i = 0; i < this.functionData.length; i++) {
                    if (this.functionData[i] !== rowData) {
                        this.$refs.functionData.toggleRowExpansion(this.functionData[i], false);
                    }
                }
                // 展开的关闭，关闭的展开
                if(this.activeIndex == index) {
                    this.activeIndex = -1;
                    this.activeRow = {};
                    shouldOpen = false;
                }else {
                    this.activeIndex = index;
                    this.activeRow = rowData;
                    shouldOpen = true;
                }
                // 展开/关闭
                this.$refs.functionData.toggleRowExpansion(rowData, shouldOpen);
                if(shouldOpen){
                    if(this.dataTimer) clearTimeout(this.dataTimer);
                }else {
                    this.dataTimer = setTimeout(this.getData,10000);
                }
            },

            // 获取数据
            async getData(){
                if(this.dataTimer) clearTimeout(this.dataTimer);
                try {
                    let res = await getOrtherContract({
                        pageSize: 10,
                        pageNumber:this.page
                    })
                    this.functionData = res.data.funcData;
                    this.count = res.data.count;
                    this.page = res.data.pageNumber;
                }catch(e){
                    console.log(e)
                }
                this.dataTimer = setTimeout(this.getData,10000)
            },

            // 翻页
            gopage(page){
                this.page = page;
                this.getData();
            },

            // 执行函数按钮
            async run($index,index2){
                let root = this.functionData[$index];
                let item = this.functionData[$index].func[index2];
                let typeArr = [], valueArr = [];

                for (let i = 0; i < item.keys.length; i++) {
                    typeArr[i] = item.keys[i].keytype;
                    valueArr[i] = item.keys[i].keyval;
                }
                try {
                    let res = await contractInvoke({
                        contractAddress: root.contractAddress,//合约地址
                        methodName: item.name,//方法名
                        typeArr: typeArr,//方法参数类型
                        valueArr: valueArr,//参数，跟上面的请一一对应
                    })
                }catch(e){
                    console.log(e)
                }

                // 还原空值
                for (let i = 0; i < item.keys.length; i++) {
                    if(typeof(item.keys[i].keyval) == 'string'){
                        item.keys[i].keyval = ''
                    }
                    if(item.keys[i].keyval instanceof Array){
                        item.keys[i].keyval = []
                    }
                }
            },
            
            // 数组参数操作——删除数组内容
            handleClose($index,index2,index3,tag) {
                let item = this.functionData[$index].func[index2].keys[index3];
                item.keyval.splice(item.keyval.indexOf(tag), 1);
            },
            // 数组参数操作——显示input
            showInput(inpRef,item) {
                item.inputVisible = true;
                this.$nextTick(_ => {
                    this.$refs[inpRef][0].$refs.input.focus();
                });
            },
            // 数组参数操作——添加数组内容
            handleInputConfirm($index,index2,index3) {
                let item = this.functionData[$index].func[index2].keys[index3];
                if (item.inputValue) {
                    item.keyval.push(item.inputValue);
                }
                item.inputVisible = false;
                item.inputValue = '';
            },

            // placeholder的类型提示
            TypeText(type) {
                // 布尔类型无需使用placeholder
                if(/(String|List)$/.test(type)) return '字符' 
                if(/(byte\[\]|short\[\]|int\[\]|long\[\]|double\[\]|float\[\])$/.test(type)) return '数字' 
                if(/(byte|short|int|long|double|float)$/.test(type)) return '数字' 
                if(/Map$/.test(type)) return '参数名:参数值(多个则用-隔开)' 
                return ''
            },
            isTypeFit(keytype,type){
                if(type=='arr' && /(\[\]|List)$/.test(keytype)) return true;
                if(type=='str_num' && /(byte|short|int|long|double|float|String)$/.test(keytype)) return true;
                if(type=='boo' && /boolean$/.test(keytype)) return true;
                if(type=='map' && /Map$/.test(keytype)) return true;
                return false
            }
        }
    }
</script>
<style lang='scss' scoped>
.runfunction{
    padding: 50px 40px 40px 50px;
    box-sizing: border-box;
    &>h4 {
        color:#484E64;
        font-size: 28px;
        padding-bottom: 30px;
        i {
            font-size: 28px;
            vertical-align: baseline;
        }
        span {
            font-size: 22px;
            padding-left: 20px;
        }
    }
}
    .inpahead {
        display: inline-block;
        vertical-align: middle;
        line-height: 26px;
        width: 100px;
        padding: 0;
        border: 1px solid #dcdfe6;
        border-radius: 4px 0 0 4px;
        box-sizing: border-box;
        background-color: #f5f7fa;
        color: #909399;
        font-size: 12px;
        text-align: center;
        white-space: nowrap;
    }
    .tags {
        height: 28px;
        padding: 0 8px;
        line-height: 26px;
        vertical-align: -1px;
    }

</style>