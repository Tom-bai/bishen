<template lang='pug'>
    .account
        //- 概述
        .account-box
            h4
                i.iconfont.icon-jiaoseguanli
                span {{$t('account.overview')}}
            p {{$t('accountTip.tip1')}}
        //- 账户
        .account-box
            
            h4
                i.iconfont.icon-957caidan_qianbao
                span {{$t('account.accounts')}}
            el-row.account-box-wallet(:gutter='10')
                el-col.account-box-wallet-item.clearfix(
                        :span='8'
                        v-for='(item,index) in $store.state.Counter.accountInfo.accounts'
                        :key='index'
                    )
                    el-row
                        el-col(:span='6').left
                            span {{$t('account.wallet')+(index+1)}}
                        el-col(:span='18').right
                            h4 {{item.balance}} PTN
                                span.more(@click='goDetail(item.address)') {{$t('account.more')}}&gt;
                            p {{item.address}}
                            button.copy(
                                v-clipboard:copy="item.address"
                                v-clipboard:success="onCopy"
                                v-clipboard:error="onError"
                            ) {{$t('account.copy')}}
            .account-box-btn
                button(@click='add').add-wallet
                    span {{$t('account.add')}}
                button(@click='showInput').add-wallet
                    span {{$t('account.import')}}
        //- 智能合约
        .account-box
            //- 概述
            h4
                i.iconfont.icon-hetong
                span {{$t('account.contract')}}
            p {{$t('accountTip.tip2')}}
            .account-box-btn
                button(@click='createContract').add-wallet
                    //- 提交合约
                    span {{$t('contract.submit')}}
                button(@click='contractDetail').add-wallet
                    //- 我的合约
                    span {{$t('contract.mycontract')}}
        //- 添加钱包
        transition(name="el-fade-in-linear")
            .mask(v-if='create')
                .mask-box
                    .mask-box-tit
                        h4 {{$t('account.addWallet')}}
                    .mask-box-item
                        el-input(:placeholder='$t("account.pwdPlaceholder")' v-model='pwd1' type='password')
                            template(slot='prepend') {{$t('account.password')}}
                    .mask-box-item
                        el-input(:placeholder='$t("account.againPlaceholder")' @keyup.enter.native='createAccount' v-model='pwd2' type='password')
                            template(slot='prepend') {{$t('account.again')}}
                    .mask-box-item.right
                        el-button(type='default' @click='cancel') {{$t("account.cancel")}}
                        el-button(type='primary' @click='createAccount') {{$t("account.enter")}}
        //- 导入钱包弹窗
        transition(name="el-fade-in-linear")
            .mask(v-if='isInput')
                .mask-box3(v-if='step==1')
                    .mask-box3-tit
                        h4 {{$t('account.importFile')}}
                    el-row.mask-box3-content(:gutter='20')
                        el-col(:span='12')
                            .context {{content}}
                        el-col(:span='12')
                            .input(@click='selectFile' @drop='drop($event)' @dragover='allowDrop($event)') {{$t('account.importFile')}}
                    .mask-box3-btn
                        el-button(type='default' size='small' @click='cancelInp') {{$t('account.cancel')}}
                        el-button(type='primary' size='small' @click='nextStep') {{$t('account.nextStep')}}
                .mask-box4(v-if='step==2')
                    .mask-box4-tit
                        h4 {{$t('account.inputMnemonic')}}
                        p {{$t('account.mnemonicTip')}}
                    .mask-box4-content
                        el-input(type='textarea' resize='none' v-model='backupTxt')
                    .mask-box4-btn
                        el-button(type='default' size='small' @click='cancelInp') {{$t('account.cancel')}}
                        el-button(type='primary' size='small' @click='inPut') {{$t('account.enterAdd')}}
</template>

<script>
import fs from 'fs';
const {dialog} = require('electron').remote
import { createAccount,importWallet } from '@/http/index.js'
export default {
    destroyed() {
        clearInterval(this.timer);
        this.timer=null;
    },
    data() {
        return {
            create:false,
            content:'',
            step:1,
            isInput:false,
            backupTxt:'',
            accounts:[],
            pwd1:'',
            pwd2:'',
            timer:null
        }
    },
    methods: {
        async createAccount() {// 创建钱包
            if(this.pwd1!=this.pwd2 || this.pwd1=='') {
                this.$message({
                    type: 'error',
                    message: this.$t('tip.tip1')
                });
                return false;
            }
            try {
                let res = await createAccount({
                    passWord:this.pwd1
                })
                if(res) {
                    if(res.code==100){
                        this.$store.commit('UPDATE_ADDRESS');
                        this.$message({
                            type: 'success',
                            message: this.$t('tip.code100')
                        });
                    }
                    this.create=false;
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async inPut() { // 导入钱包
            try {
                let res = await importWallet({
                    mnemonicText:this.backupTxt,
                    jsonStr:this.content
                })
                if(res) {
                    this.$store.commit('UPDATE_ADDRESS');
                    this.isInput=false;
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        contractDetail() {
            this.$router.push('/home/account/contract')
        },
        createContract() {
            this.$router.push('/home/account/createContract');
        },
        onCopy() { // 复制钱包地址
            this.$message({
                type: 'success',
                message: this.$t('tip.tip3')
            });
        },
        onError() { // 复制失败事件
            this.$message({
                type: 'error',
                message: this.$t('tip.tip4')
            });
        },
        showInput() { // 导入钱包
            this.step=1;
            this.content='';
            this.backupTxt=''
            this.isInput=true
        },
        cancelInp() { // 关闭导入窗口
            this.isInput = false
        },
        selectFile() { // 导入钱包文件文件事件
            let file=dialog.showOpenDialog({
                properties: ['openFile', 'multiSelections'],
                filters: [{name: 'ptn file', extensions: ['ptn']}]
            });
            if( file ) {
                if(!(/\.ptn$/.test(file[0]))){
                    this.$message({
                        type: 'warning',
                        message: this.$t('tip.fileTypeFail')//文件格式不正确
                    });
                    return false
                }
                fs.readFile(file[0],'utf8',(err,data)=>{
                    if(!err) {
                        this.content = data;
                    }
                });
            }
        },
        drop(event){ // 拖拽事件
            // 阻止默认事件
            event.preventDefault();

            console.log(event.dataTransfer.files[0].name)
            // 检验格式
            if(!(/(\.ptn{1})$/.test(event.dataTransfer.files[0].name))){
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.fileTypeFail')
                });
                return false
            }
            // 读取
            fs.readFile(event.dataTransfer.files[0].path,'utf8',(err,data)=>{
                if(!err) {
                    this.content = data;
                }
            });
        },
        nextStep() { // 导入钱包的下一步
            if(this.content=='') {
                this.$message({
                    type: 'error',
                    message: this.$t('tip.tip2')
                });
                return false;
            }
            this.step = 2;
        },
        allowDrop(event){ // 拖拽经过阻止事件
            event.preventDefault();
        },
        add() { // 添加钱包
            this.pwd1='';
            this.pwd2='';
            this.create = true;
        },
        cancel() { // 取消添加钱包
            this.create = false;
        },
        goDetail(address) { // 查看详情跳转
            this.$router.push('/home/account/detail/'+address)
        },
        inputFile(event) { // 导入文件阻止事件
            event.stopPropagation()
        }
    },
    computed: {
        getUpdateState() {
            return this.$store.state.Counter.address
        }
    },
    watch: {
        getUpdateState(val){
            this.getAllAccount();
        }
    }
}
</script>

<style lang='scss'>
    @import './account.scss';
</style>
