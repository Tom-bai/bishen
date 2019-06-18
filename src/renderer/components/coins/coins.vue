<template lang='pug'>
    .token
        .container
            //- Token概述
            .token-box
                h4
                    i.iconfont.icon-jiaoseguanli
                    span {{$t('token.overview')}}
                    .token-btn
                        button(@click='addToken')  {{$t('token.add')}}
                        button(@click='showMask(true)')  {{$t('token.issued')}}
                p {{$t('accountTip.tip1')}}
            //- 钱包账户
            .token-box
                h4
                    i.iconfont.icon-957caidan_qianbao
                    span {{$t('account.accounts')}}
                el-row.token-box-wallet(:gutter='10')
                    el-col.token-box-wallet-item.clearfix(:span='8' :key='index'
                            v-for='(item,index) in $store.state.Counter.accountInfo.accounts')
                        el-row
                            el-col(:span='6').left
                                span {{$t('account.wallet')+(index+1)}}
                            el-col(:span='18').right
                                h4 {{item.balance}} {{$route.params.tokenName}}
                                    span.more(@click='goDetail(item.address)') {{$t('account.more')}}&gt;
                                p {{item.address}}
                                button.copy(
                                    v-clipboard:copy="item.address"
                                    v-clipboard:success="onCopy"
                                    v-clipboard:error="onError"
                                ) {{$t('account.copy')}}
            //- 发行Token
            .token-box
                transition(name="el-fade-in-linear")
                    .coinmask(v-if='create')
                        .coinmask-box
                            .coinmask-box-tit
                                h4 {{$t('token.issued')}}
                            .coinmask-box-item

                                    .wallet-address
                                        span {{$t('token.address')}}
                                    .wallet-sel
                                        el-select(v-model='address' style='width:100%' :placeholder='$t("transaction.select")')
                                            el-option(v-for="item in $store.state.Counter.accountInfo.accounts"
                                            :key="item.address"
                                            :label="item.address"
                                            :value="item.address")
                            .coinmask-box-item
                                el-input(:placeholder='$t("token.nameLabel")' @change='testData' v-model='token.name' type='text')
                                    template(slot='prepend') {{$t('token.name')}}
                            .coinmask-box-item
                                el-input(:placeholder='$t("token.unitLabel")' @change='testData1' v-model='token.unit' type='text')
                                    template(slot='prepend') {{$t('token.unit')}}
                            .coinmask-box-item
                                el-input(:placeholder='$t("token.numLabel")' @change='testData2' v-model='token.num' type='text')
                                    template(slot='prepend') {{$t('token.num')}}
                            .coinmask-box-item
                                el-input(:placeholder='$t("token.pwdLabel")' v-model='token.pwd' type='password')
                                    template(slot='prepend') {{$t('token.pwd')}}
                            .coinmask-box-item
                                el-input(:placeholder='$t("token.remarkLabel")' v-model='token.remarks' resize='none' type='textarea')
                            .coinmask-box-item
                                .left
                                    span.tip {{$t('token.fee')}}
                                    span.price {{token.fee}}
                                .right
                                    el-button(type='default' @click='showMask(false)') {{$t("account.cancel")}}
                                    el-button(type='primary' @click='createToken') {{$t("account.enter")}}
</template>

<script>
import fs from 'fs';
const {dialog} = require('electron').remote
import { createAccount,importWallet,addToken,getAddTokenFee } from '@/http/index.js'

let createToken = async()=> {// 发行代币
    // 判断版本
    let isMatch = await this.IS_VER_MATCH();
    if(!isMatch) return false
    try {
        let res = await addToken({
            address:this.address,
            symbol:this.token.name,
            name:this.token.name,
            decimals:this.token.unit,
            tokenAmount:this.token.num,
            remark:this.token.remarks,
            passWord:this.token.pwd,
            isfresh: false,
        })
        if(res) return res;
        
    }
    catch (e) {
        console.log(e);
    }
}

export default {
    watch: {
        "$store.state.Counter.accountInfo": function() {
            if (!this.isfresh) {
                this.address = this.$store.state.Counter.accountInfo.accounts[0].address;
                this.isfresh = true;
            }
        }
    },
    mounted() {
        this.address = this.$store.state.Counter.accountInfo.accounts[0].address;
    },
    destroyed() {
        clearInterval(this.timer);
        this.timer=null;
    },
    data() {
        return {
            timer:null,
            create:false,
            content:'',
            step:1,
            isInput:false,
            backupTxt:'',
            accounts:[0,0],
            token: {
                flag:'',
                name:'',
                unit:null,
                num:null,
                pwd:'',
                remarks:'',
                fee:0
            },
            address:'',
            myAddress:[],
        }
    },
    methods: {
        async getAddTokenFee() {// 获取代币手续费
            try {
                let res = await getAddTokenFee({
                    name:this.token.name,
                    tokenAmount:this.token.num||0,
                    decimal:this.token.unit||0
                })
                if(res) {
                    this.token.fee=res.data.fee;
                }
                
            }
            catch (e) {
                console.log(e);
            }
        },
        testData1() {
            let reg1 = /^[0-9]+$/
            if(!(reg1.test(this.token.unit) && parseInt(this.token.unit) >= 6 && parseInt(this.token.unit) <= 8)) {
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.tip11')
                });
                return false;
            }
            this.getAddTokenFee()
        },
        testData2() {
            let reg1 = /^[0-9]+$/
            if(!(reg1.test(this.token.num) && parseInt(this.token.num) >= 1000 && parseInt(this.token.num) <= 99999999999)) {
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.tip9')
                });
                return false;
            }
            this.getAddTokenFee()
        },
        testData() {
            let reg = /^[0-9a-zA-Z]{3,20}$/
            

            if(!reg.test(this.token.name)) {
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.tip7')
                });
                return false;
            }
            this.getAddTokenFee()

        },
        async buildToken() {// 创建代币
            console.log(this.address)
            try {
                let res = await addToken({
                    address:this.address,
                    symbol:this.token.flag,
                    name:this.token.name,
                    decimals:this.token.unit,
                    tokenAmount:this.token.num,
                    remark:this.token.remarks,
                    passWord:this.token.pwd
                })
                if(res) return res;
                
            }
            catch (e) {
                console.log(e);
            }
        },
        showMask(bool) { // 显示创建代币框
            this.create=bool;
            if(bool==true) {
                this.token.flag='';
                this.token.name='';
                this.token.unit='';
                this.token.num='';
                this.token.remarks='';
                this.token.pwd='';
                this.token.fee='';
                // this.getAccounts().then((res)=> {
                //     this.myAddress=res.data.accounts;
                //     this.address=res.data.accounts[0].address;
                // })
                // clearInterval(this.timer);
                // this.timer=null;
            }
        },
        onCopy() {//复制钱包地址
            this.$message({
                type: 'success',
                message: this.$t('tip.tip3')
            });
        },
        onError() {
            this.$message({
                type: 'error',
                message: this.$t('tip.tip4')
            });
        },
        goDetail(address) {
            this.$router.push('/home/tokendetail/'+address+'/'+this.$route.params.tokenName)
            // console.log('/account/detail/'+address)
        },
        async createToken() {
            // 判断版本
            let isMatch = await this.IS_VER_MATCH();
            if(!isMatch) return false

            let reg = /^[0-9a-zA-Z]{3,20}$/
            let reg1 = /^[0-9]+$/

            if(!reg.test(this.token.name)) {
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.tip7')
                });
                return false;
            }else if(!(reg1.test(this.token.unit) && parseInt(this.token.unit) >= 6 && parseInt(this.token.unit) <= 8)) {
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.tip11')
                });
                return false;
            }else if(!(reg1.test(this.token.num) && parseInt(this.token.num) >= 1000 && parseInt(this.token.num) <= 100000000000)) {
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.tip9')
                });
                return false;
            }
            
            
            this.buildToken().then((res)=>{
                if(res) {
                    this.showMask(false);
                    if(res.code == '119') this.$router.push('/home/account/contract/othercoin');
                }
            })
        },
        addToken() {
            this.$router.push('/home/token/alltoken')
        }
    },
    computed: {
        getUpdateState() {
            return this.$store.state.Counter.address
        }
    },

}
</script>

<style lang='scss'>
    @import './coins.scss';
</style>
