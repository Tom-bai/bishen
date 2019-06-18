<template lang="pug">
    .runfunction
        h4 
            i.iconfont.icon-jiaoseguanli
            span {{$t('nav.othercontracts')}}
        el-table(:data="functionData" ref="functionData" style="width: 100%" )
            el-table-column(prop="contractAddress" :label="$t('othercontracts.conAddr')")

            el-table-column(prop="issuer" :label="$t('othercontracts.conIssuer')")

            el-table-column(prop="className" :label="$t('othercontracts.class')")

            el-table-column(:label="$t('othercontracts.detail')" width="100")
                template(slot-scope="scope")
                    el-button(type="primary" size="mini" @click="expandRow(scope.index,scope.row)") {{$t('othercontracts.detail')}}

            el-table-column(type="expand" width="20")
                template(slot-scope="{ row, column, $index }")
                    //- el-row(:gutter="20")
                        el-col(:span="16")
                    el-table(:data="row.func" style="width: 100%" size="mini" maxheight="600")
                        el-table-column(prop="name" :label="$t('othercontracts.funcName')" width="150")
                        el-table-column(:label="$t('othercontracts.paramsExample')")
                            template(slot-scope="props")
                                el-button(slot="reference" @click="show2Textarea(row,props.$index)" type="primary" plain size="mini") {{$t('othercontracts.show')}}
                        el-table-column(prop="returnType" :label="$t('othercontracts.resType')")
        el-pagination(class="elPage" background layout="prev, pager, next" :current-page='page' :total='count' :pageSize='pagesize' @current-change='gopage')

        //- 参数输入弹窗
        el-dialog(:title="$t('othercontracts.paramsEdit')" :visible.sync="dialogVisible" top="12vh")
            .tips {{$t('othercontracts.EditTips')}}
            .params
                el-input(type="textarea" v-model="params" :autosize="{ minRows: 20}")
            div(slot="footer" class="dialog-footer")
                el-button(@click="dialogVisible = false" size="mini") {{$t('othercontracts.cancel')}}
                el-button(type="primary" @click="run" size="mini") {{$t('othercontracts.doit')}}
        
        //- 返回值弹窗
        el-dialog(:title="$t('othercontracts.res')" :visible.sync="dialogVisible_res" top="12vh")
            .btns
                el-button(type="primary" v-clipboard:copy="funcRes" v-clipboard:success="onCopy" size="mini") {{$t('account.copy')}}
            .res
                el-input(type="textarea" v-model="funcRes" :autosize="{ minRows: 20}" readonly)
                
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
                pagesize:10,
                activeIndex: -1,//一层table展开行下标
                activeRow:{},//展开行内容
                activeIndex2: -1,//二层table显示参数时当行的下标
                dialogVisible: false,
                params:'',
                dialogVisible_res:false,
                funcRes:''
            }
        },
        mounted(){
            this.getData();
        },
        destroyed() {
            if(this.dataTimer) clearTimeout(this.dataTimer);
        },
        methods:{
            // 每个函数的参数提示内容
            popContent($index,index){
                let obj = this.functionData[$index].func[index]
                return JSON.stringify(obj)
            },
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
                
                if(shouldOpen){
                    if(this.dataTimer) clearTimeout(this.dataTimer);
                }else {
                    this.dataTimer = setTimeout(this.getData,10000);
                }
                // 展开/关闭
                this.$refs.functionData.toggleRowExpansion(rowData, shouldOpen);
                
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
                        // 假数据
                        // let res = {"code":100,"data":{"funcData":[{"func":[{"keys":[{"keyname":"变量名","keytype":"java.lang.String","keyval":""},{"keyname":"变量名","keytype":"java.lang.String","keyval":""},{"keyname":"变量名","keytype":"java.lang.String","keyval":""}],"name":"test","returnType":"int"},{"keys":[{"keyname":"变量名","keytype":"java.lang.String","keyval":""}],"name":"test","returnType":"java.lang.String"},{"keys":[{"keyname":"变量名","keytype":"java.util.Map","keyval":""}],"name":"getMap","returnType":"java.util.Map<java.lang.String, java.lang.Object>"},{"keys":[{"keyname":"变量名","keytype":"","keyval":""}],"name":"haha","returnType":"void"},{"keys":[{"keyname":"变量名","keytype":"int[]","keyval":""}],"name":"bubbleSort","returnType":"void"},{"keys":[{"keyname":"变量名","keytype":"java.util.List","keyval":""}],"name":"listTest","returnType":"java.util.List<java.lang.String>"}],"contractAddress":"px63652wrsdg365","className":"compiler.NewTest","issuer":"px6546r5egfhqsaffdsa"}],"pageNumber":1,"count":100}}
                        // this.functionData = res.data.funcData;
                        // this.count = res.data.count;
                        // this.page = res.data.pageNumber;
                this.dataTimer = setTimeout(this.getData,10000)
            },

            // 翻页
            gopage(page){
                this.page = page;
                this.getData();
            },

            // 显示参数例子，以及例子复制到textarea上
            show2Textarea(rootRow,index){
                this.activeIndex2 = index;
                // 复制到textarea
                this.params = JSON.stringify(rootRow.func[index].keys, null, 2).replace(/"{/g,'{').replace(/}"/g,'}').replace(/"\[/g,'[').replace(/]"(?!,)/g,']').replace(/\\/g,'');
                this.dialogVisible = true;
            },

            // 执行函数按钮
            async run(){
                let root = this.activeRow;
                let item = this.activeRow.func[this.activeIndex2];
                let params = JSON.parse(this.params);
                let typeArr=[],valueArr=[];
                for (let i = 0; i < params.length; i++) {
                    typeArr[i] = params[i].keytype;
                    valueArr[i] = params[i].keyval;
                }
                try {
                    let res = await contractInvoke({
                        contractAddress: root.contractAddress,//合约地址
                        methodName: item.name,//方法名
                        // typestr: typeArr,//方法参数类型(xxx-xxx-xxx)
                        typeArr: JSON.stringify(typeArr),//方法参数类型([xxx,xxx,xxx])
                        valueArr: JSON.stringify(valueArr),//参数，跟上面的请一一对应([xxx,xxx,xxx])
                    })
                    // res = {code:151,data:{code:200,data:{s:[1,2]}}}//假数据
                    // if(res&&res.code == 151){
                        this.dialogVisible = false;
                        this.funcRes = JSON.stringify(res.data,null,2).replace(/"{/g,'{').replace(/}"/g,'}').replace(/"\[/g,'[').replace(/]"(?!,)/g,']').replace(/\\/g,'');
                        this.dialogVisible_res = true;
                    // }
                }catch(e){
                    console.log(e)
                }
            },
            
            onCopy(){
                this.$message({
                    type: 'success',
                    message: this.$t('tip.tip3')
                })
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
    .tips {
        line-height: 28px;
    }
    .btns {
        position: relative;
        text-align: right;
        margin-bottom: -35px;
        padding-right: 5px;
    }
</style>