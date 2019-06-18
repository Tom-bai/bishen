<template lang='pug'>
    .transaction
        el-row.transaction-box(:gutter='20')
            //- 发送地址
            el-col(:span='12')
                h4 
                    i.iconfont.icon-jiaoseguanli
                    span {{$t('transaction.send')}}
                .wallet
                    el-select(v-model='address' @change='changeAccount' style='width:100%' :placeholder='$t("transaction.select")')
                        el-option(v-for="item in myAddress"
                        :key="item.address"
                        :label="item.address"
                        :value="item.address")
            //- 代币列表
            el-col(:span='12')
                h4 
                    i.iconfont.icon-xiugaimima
                    span {{$t('transaction.selToken')}}
                .wallet
                    el-select(v-model='token' @change='changeTokenName' style='width:100%' placeholder='选择交易Token')
                        el-option(
                        label="ptn"
                        value="ptn")
                        el-option(v-for="item in myToken"
                        :key="item"
                        :label="item"
                        :value="item")
        el-row.transaction-box(:gutter='20')
            //- 接收地址
            el-col(:span='12')
                h4 
                    i.iconfont.icon-dizhi
                    span {{$t('transaction.recieve')}}
                .wallet
                    #select-box
                        span {{$t('transaction.recAddress')}}
                    input.recieve(v-model.trim='reciever' :placeholder='$t("transaction.recPlaceholder")' @change='getRec')
                    .publickey(v-if='pubShow')
                        input(v-model='key' :placeholder='$t("transaction.pubKeyPlaceholder")')
            //- 交易金额
            el-col(:span='12')
                h4 
                    i.iconfont.icon-957caidan_qianbao
                    span {{$t('transaction.nums')}}
                .num
                    input(:placeholder='$t("transaction.amountPlaceholder")' @change='getFee' v-model='nums')
        el-row.transaction-box(:gutter='20')
            //- 备注信息
            el-col(:span='12')
                h4 
                    i.iconfont.icon-xiazai16
                    span {{$t('transaction.remarks')}}
                .remark
                    textarea(v-model='remark' :placeholder='$t("transaction.remarkPlaceholder")')
            //- 旷工费用
            el-col(:span='12')
                h4 
                    i.iconfont.icon-price
                    span {{$t('transaction.fee')}}
                .fee        
                    el-slider(v-model='fee' @change='getFee' :min='1' :max='100000000')
                    .data-text.clearfix
                        .left
                            span {{$t("transaction.amount")}}
                            span.orange {{numsMul(this.fee,0.000001)}}
                                //- el-input(size='mini' v-model='fee' style='width:50px;')
                            span ptn
        el-row.transaction-box(:gutter='20')
            //- 交易密码
            el-col(:span='12')
                h4 
                    i.icon-suopingmima.iconfont
                    span {{$t('transaction.pwd')}}
                .amount
                    input(:placeholder='$t("transaction.pwdPlaceholder")' v-model='password' type='password')
                    //- span {{$t("transaction.total")+': '+amount}}
        el-row.transaction-box(:gutter='20')
            //- 确认转出
            el-col(:span='12').enter
                button(@click='sendCoin') {{$t('transaction.enter')}}
            el-col(:span='12')
                


</template>

<script>
import { getAllAccount,transferAccounts,validataAddressIsTrans,getTokenListByAddress,numsAdd,numsMul } from '@/http/index.js'
export default {
    mounted() {
        this.getAllAccount()
    },
    data() {
        return {
            fee:1,
            address:'',
            myAddress:[],
            token:'ptn',
            myToken:[],
            reciever:'',
            pubShow:false,
            nums:'',
            allfee:0,
            amount:0,
            password:'',
            remark:'',
            key:''
        }
    },
    methods: {
        async enterSend() {// 获取账户信息
            try {
                let res = await transferAccounts({
                    transFrom:this.address,
                    transTo:this.reciever,
                    transValue:this.nums,
                    fee:this.allfee,
                    passWord:this.password,
                    remark:this.remark,
                    transToPubkey:this.key,
                    tokenName:this.token
                })
                if(res.code==201) {
                    // this.$message({
                    //     type: 'warning',
                    //     message: this.$t('tip.code201')
                    // });
                    // this.pubShow=true;
                }else {
                    this.reciever='';
                    this.nums='';
                    this.fee=1;
                    this.allfee=0;
                    this.password='';
                    this.remark='';
                    this.key='';
                    this.amount=0;
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async getRec() {// 获取账户信息
            try {
                let res = await validataAddressIsTrans({
                    address:this.reciever,
                    tokenName:this.token,
                })
                if(res.code == 201) {
                    this.pubShow = true;
                }else {
                    this.key = '';
                    this.pubShow = false;
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async getAllAccount() {// 获取账户信息
            try {
                let res = await getAllAccount()
                if(res && res.code==100) {
                    this.myAddress=res.data.accounts;
                    this.address=res.data.accounts[0].address;
                    this.getTokenListByAddress();
                }else {
                    this.myAddress=[];
                } 
            }
            catch (e) {
                console.log(e);
            }
        },
        async getTokenListByAddress() {// 获取token列表
            try {
                let res = await getTokenListByAddress({
                    address:this.address
                })
                // console.log(res.data)
                if(res.data.length>0) {
                    this.myToken=res.data;
                    this.token='ptn';
                    this.$store.commit("UPDATE_TOKEN",'ptn');
                }else {
                    this.myToken=[];
                    this.token='ptn';
                    this.$store.commit("UPDATE_TOKEN",'ptn');
                }
                
            }
            catch (e) {
                console.log(e);
            }
        },
        numsMul(a,b) { // 浮点数相乘
            return numsMul(a,b)
        },
        getFee(val) { // 计算总费用
            this.allfee=numsMul(this.fee,0.000001);
            this.amount = numsAdd(parseFloat(this.nums||0),parseFloat(this.allfee));
        },
        changeAccount() { // 切换账户事件
            this.getTokenListByAddress();
        },
        changeTokenName() { // 选择Token事件
            this.$store.commit("UPDATE_TOKEN",this.token);
            this.reciever='';
            this.key='';
            this.pubShow=false;
        },
        async sendCoin() {
            // 判断版本
            let isMatch = await this.IS_VER_MATCH();
            if(!isMatch) return false
            // 逻辑代码
            let reg = /^\d+(\.\d+)?$/
            if(!reg.test(this.nums)) {
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.tip10')
                });
                return false;
            }
             if (!this.reciever) {
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.tip14')
                });
                return false;
            }
            this.enterSend()
        },
        
    }
}
</script>

<style lang='scss'>
    @import './transaction.scss';
</style>
