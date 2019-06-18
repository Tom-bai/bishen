<template lang='pug'>
    .createContract
        a.back(@click='backPage') << {{$t('contract.back')}}
        el-row.contract-box(:gutter='20') 
            el-col(:span='12')
                h4 
                    //- 合约账户
                    i.iconfont.icon-jiaoseguanli
                    span {{$t('contract.account')}}
                .wallet
                    //- 合约类型
                    el-select(v-model='address' style='width:100%' :placeholder='$t("transaction.select")')
                        el-option(v-for="(item,index) in myAddress"
                        :key="index"
                        :label="item.address"
                        :value="item.address")
            el-col(:span='12')
                h4 
                    //- 合约代码
                    i.iconfont.icon-jiaoseguanli
                    span {{$t('contract.type')}}
                .wallet
                    el-select(v-model='type' style='width:100%' @change="optionChange")
                        el-option(
                            :label="$t('contract.pend')"
                            :value="1") {{$t('contract.pend')}}
                        el-option(
                            :label="$t('vote.vote')"
                            :value="2") {{$t('vote.vote')}}
                        el-option(
                            :label="$t('othercoin.othercoin')"
                            :value="3") {{$t('othercoin.othercoin')}}
                        el-option(
                            :label="$t('contract.othercontract')"
                            :value="4") {{$t('contract.othercontract')}}
        el-row.contract-box
            el-col(:span='24')
                h4
                    i.iconfont.icon-jiaoseguanli
                        span {{$t('contract.code')}}
                el-input.textarea(v-model="str" type="textarea" @blur="createContract")
            el-col.enter(:span='24')
                p.fee {{$t('contract.fee')}}：
                    span {{fee}}
                    span.error(v-if='err') {{code}}
                el-button(type='primary' @click='enterContract') {{$t('contract.compile')}}
</template>

<script>
import { getAllAccount,createContract,compileContract } from '@/http/index.js'
const ipc = require('electron').ipcRenderer

export default {
    mounted() {
        // 获取合约账户
        this.getAllAccount();
        this.optionChange();
    },
    data() {
        return {
            fee:'',
            address:'',
            type: 1,
            myAddress:[],
            // regx: /<[^>]*>|<\/[^>]*>|\0/gm,//去掉html标签
            str:'',
            err: false,
            editor:null,
            code:'',
            password: ''
        }
    },
    // computed:{
    // },
    methods: {
        backPage() { // 返回
            this.$router.go(-1)
        },
        // 切换挂单/投票
        optionChange(){
            if(this.type == 1){//挂单
                    this.str = 
`pcompiler version 1.0.0;
contract demo{
set coin sell = 2 ptn;
set coin pur = 1000 lin;
event business(sell,pur);
}
`
                }
                if(this.type == 2){//投票
                    this.str =  
`pcompiler version 1.0.0 ; 
contract demo{
set str title = "主题";
set arr options = ["选项1","选项2","选项3"]; 
set time t = "2019-10-02 00:00:00";
event vote(t,title,options);
}`
                }
                if(this.type == 3){//代币
                    this.str =  
`pcompiler version 1.0.0;
contract demo{
set integer tokenBit = 6;
set integer tokenNum = 100000;
set str tokenName = "ETH";
event token( tokenBit ,tokenNum ,tokenName);}
`
                }
                if(this.type == 4){//其他合约
                    this.str =  ``
                }
            this.createContract();
        },
        async getAllAccount() {// 获取账户信息
            try {
                let res = await getAllAccount()
                if(res&&res.code == 100) {
                    this.myAddress=res.data.accounts;
                    this.address=res.data.accounts[0].address;
                }else {
                    this.myAddress=[];
                }
            }
            catch (e) {
                console.log(e);
            }
        },

        async enterContract() { // 点击编译合约
            // 判断版本
            let isMatch = await this.IS_VER_MATCH();
            if(!isMatch) return false
            // 预编译合约
            const bool = await this.createContract();
            if(bool) {
                this.password = '';
                this.$prompt(this.$t('account.password'), this.$t('vote.prompt'), {
                    confirmButtonText: this.$t('account.enter'),
                    cancelButtonText: this.$t('account.cancel'),
                    inputType: 'password'
                    // inputPattern: //,
                    // inputErrorMessage: '密码格式不正确'
                }).then(async ({ value }) => {
                    this.password = value;
                    // 发布合约
                    this.compileContract();
                }).catch((err)=>{

                })
            }else {
                this.err = true;
                this.$message({
                    type: 'warning',
                    message: this.$t("contract.error")
                }); 
            }
        },

        async createContract() {// 预编译合约
            // console.log(this.str)
            try {
                let res = await createContract({
                    contractStr: this.str,
                    eventType: this.type
                })
                if(res.code===202) {
                    this.fee = res.data.fee || '0';
                    this.err = false;
                    return true;
                }else {
                    if(res.code<10000){
                        this.code = this.$t('tip.code'+res.code)
                    }else if(res.code>=10000){
                        this.code = this.$t('createCode.code'+res.code)
                    }else{
                        this.code = this.$t('contract.error')
                    }
                    this.fee = '0';
                    this.err = true;
                    return false;
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        
        async compileContract() { // 发布合约
            try {
                let res = await compileContract({
                    contractStr: this.str,
                    address: this.address,
                    eventType: this.type, //1挂单，2投票，3代币，4其他合约
                    password: this.password
                })
                if(res.code === 100) {
                    this.$message({
                        type: 'success',
                        message: this.$t("contract.enter")
                    });
                    //1挂单，2投票，3代币，4其他合约
                    if(this.type == 1) this.$router.push('/home/account/contract/contractExcharge')
                    if(this.type == 2) this.$router.push('/home/account/contract/vote')
                    if(this.type == 3) this.$router.push('/home/account/contract/othercoin')
                    if(this.type == 4) this.$router.push('/home/account/contract/othercontracts')
                }
            }
            catch (e) {
                console.log(e);
            }
        }
    },
}
</script>

<style lang='scss' scoped>
    @import './myContract/contract.scss';
</style>
