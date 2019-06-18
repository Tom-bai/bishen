<template lang='pug'>
    .account
        .account-box
            h4
                i.iconfont.icon-957caidan_qianbao
                span {{$t('accountDetail.detail')}}
                button.backup(@click='showBackup') {{$t('accountDetail.backup')}}
            p {{$t('accountDetail.firstTip')}}
            el-row.account-box-wallet(:gutter='10')
                el-col(:span='16').account-box-wallet-info.clearfix
                    .pub {{$t('accountDetail.publicKey')+': '+account.pubKey||$t('accountDetail.none')}}
                        //- button(@click='copy') {{$t('account.copy')}}
                        button.copy(
                            v-clipboard:copy="account.pubKey"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                        ) {{$t('account.copy')}}
                el-col(:span='4' v-if="$store.state.Counter.nowToken.toLowerCase() == 'ptn'").account-box-wallet-info.clearfix
                    .btn
                        i(:class='isForg?"success":"no-link"')
                        span {{forgStatus}}
                        button(@click='forg') {{forgBtn}}
            el-row.account-box-wallet(:gutter='10')
                el-col(:span='5').account-box-wallet-info.clearfix
                    .info {{$t('accountDetail.available')+': '+account.balance||0}}
                el-col(:span='5').account-box-wallet-info.clearfix
                    .info {{$t('accountDetail.effective')+': '+account.totalEffectiveIncome||0}}
                el-col(:span='14').account-box-wallet-info.clearfix
                    .info {{$t('accountDetail.address')+': '+account.address}}
                        button.copy(
                            v-clipboard:copy="account.address"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                        ) {{$t('account.copy')}}
        //- 交易记录
        .account-list
            h4
                i.iconfont.icon-shizhong-copy
                span {{$t('accountDetail.record')}}
            el-tabs(v-model="ieType" @tab-click="tabClick")
                el-tab-pane(:label="$t('accountDetail.zc')" name="0")
                el-tab-pane(:label="$t('accountDetail.sr')" name="1")
            //- 交易记录标题
            el-row.account-list-tit
                el-col(:span='4')
                    span {{$t('accountDetail.date')}}
                el-col(:span='2')
                    span {{$t('accountDetail.height')}}
                el-col(:span='5')
                    span {{$t('transaction.send')}}
                el-col(:span='5')
                    span {{$t('transaction.recieve')}}
                el-col(:span='2')
                    span {{$t('accountDetail.nums')}}
                el-col(:span='2')
                    span {{$t('accountDetail.fee')}}
                el-col(:span='2')
                    span {{$t('accountDetail.type')}}
                el-col(:span='2')
                    span {{$t('accountDetail.confirm')}}
            .account-list-box
                el-row.account-list-box-item(
                    v-for='(item,index) in list'
                    :key='index'
                )
                    el-col(:span='4')
                        span {{item.date}}
                    el-col(:span='2')
                        span {{item.blockHeight}}
                    el-col(:span='5' style='overflow:hidden;text-overflow: ellipsis;cursor:pointer;')
                        el-popover(placement="top-end"
                        width="370"
                        trigger="hover"
                        :content="item.from")
                            span(slot="reference" v-clipboard:copy="item.from") {{item.from}}
                    el-col(:span='5' style='overflow:hidden;text-overflow: ellipsis;cursor:pointer;')
                        el-popover(placement="top-end"
                        width="370"
                        trigger="hover"
                        :content="item.to")
                            span(slot="reference" v-clipboard:copy="item.to") {{item.to}}
                    el-col(:span='2')
                        span {{item.amount}}
                    el-col(:span='2')
                        span {{item.fee}}
                    el-col(:span='2' v-if='item.type==0')
                        //- span {{type[item.type]}}
                        span(v-if='ieType==0') {{$t('accountDetail.zc')}}
                        span(v-else) {{$t('accountDetail.sr')}}
                    el-col(:span='2' v-else)
                        span {{$t('accountDetail.type'+item.type)}}
                    el-col(:span='2')
                        span {{item.confirm}}
            .account-list-page
                el-pagination(layout="prev, pager, next" :total="count" @current-change='changePage')
        .mask(v-if='isBackup')
            .mask-box1(v-if='step==1')
                .mask-box1-tit
                    h4 {{$t('accountDetail.remember')}}
                    p {{$t('accountDetail.tip')}}
                .mask-box1-content
                    p {{str}}
                .mask-box1-btn
                    el-button(type='default' size='small' @click='hideBackup') {{$t('accountDetail.cancel')}}
                    el-button(type='primary' size='small' @click='nextStep') {{$t('accountDetail.next')}}
            .mask-box2(v-if='step==2')
                .mask-box2-tit
                    h4 {{$t('accountDetail.remember')}}
                    p {{$t('accountDetail.rememberTip')}}
                .mask-box2-content
                    el-input(type='textarea' resize='none' v-model='backupTxt')
                
                .mask-box2-content
                    el-input(type='password' :placeholder='$t("accountDetail.pwdPlaceholder")' v-model='backupPwd' size="mini")
                        template(slot="prepend") {{$t('accountDetail.password')}}
                .mask-box2-content
                    el-button(type='primary' style="width:20%" size="mini" @click='selectPath') {{$t('accountDetail.path')}}
                    el-input(style="width:80%" size='mini' v-model='dirname' disabled)
                .mask-box2-content
                    el-input(v-model='backupFileName' size="mini" disabled)
                        template(slot="prepend") {{$t('accountDetail.fileName')}}
                .mask-box2-btn
                    el-button(type='default' size='small' @click='hideBackup') {{$t('accountDetail.cancel')}}
                    el-button(type='primary' size='small' @click='outPut') {{$t('accountDetail.export')}}
                    
                    
                
</template>

<script>
import fs from 'fs';
var path = require('path');
import electron from 'electron';
const {dialog} = require('electron').remote
import { exportWallet,startFoundryMachine,stopFoundryMachine,FoundryMachineState,getTransactionByPubkey } from '@/http/index.js'
import { setTimeout } from 'timers';
const ipc = require('electron').ipcRenderer

function RandomNumBoth(Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range); //四舍五入
    return num;
}
const temp = ['evaporation','carpenter','diagram','bankrupt','disadvantage','modish','counsel','potentiality','perceptive','awkward','industrious'];
export default {
    mounted() {
        // const accounts = this.$store.state.Counter.accountInfo.accounts
        // for (let item in accounts) {
        //     if(accounts[item].address === this.$route.params.address) {
        //         this.account = accounts[item];
        //         this.pubKey = accounts[item].pubKey;
        //         this.getTransactionByPubkey(1);
        //     }
        // }
        if(this.$route.params.tokenName) {
            this.token = this.$route.params.tokenName
        }
        let arr=[];
        for(let i=0;i<10;i++) {
            arr.push(temp[RandomNumBoth(0,10)]);
            
        }
        this.str=arr.join(' ');
        this.FoundryMachineState();
        this.timer=setInterval(()=>{
            this.FoundryMachineState();
        },10000)
    },
    destroyed() {
        clearInterval(this.timer);
        this.timer=null;
    },
    data() {
        return {
            waterTimer: null,
            timer:null,
            str:'',
            step:0,
            isBackup:false,
            backupTxt:'',
            backupPwd:'',
            dirname:'',
            backupFileName:'',
            page:1,
            account:{},
            list:[],
            count:1,
            isForg:false,
            token:'ptn',
            forgStatus:this.$t('tip.stop'),//锻造停止状态
            forgBtn:this.$t('tip.forgBtn'),//开始锻造按钮
            pubKey:'',
            ieType: '0',//0支出1收入
            type:{
                send:this.$t('tip.send'),
                receive:this.$t('tip.rec'),
            },
            platform:'win32'
        }
    },
    methods: {
        // 切换栏
        tabClick(){
            if(this.timer) clearInterval(this.timer);
            this.list = [];
            this.getTransactionByPubkey();
            this.timer = setInterval(()=>{
                this.FoundryMachineState();
            },13000)
        },
        //复制公钥
        onCopy() {
            this.$message({
                type: 'success',
                message: this.$t('tip.tip3')
            });
        },
        //复制公钥失败
        onError() {
            this.$message({
                type: 'error',
                message: this.$t('tip.tip4')
            });
        },
        // 锻造弹窗
        forg() {
            if(!this.isForg) {//未开始锻造
                this.$prompt(this.$t('tip.input'), 'Tip', {
                    inputType:'password',
                    confirmButtonText: this.$t('tip.enter'),
                    cancelButtonText: this.$t('tip.cancel'),
                }).then(({ value }) => {
                    this.startForging(value)
                    ipc.send('dragging',[this.$route.params.address,value])
                });
            }else {
                this.$prompt(this.$t('tip.input'), 'Tip', {
                    inputType:'password',
                    confirmButtonText: this.$t('tip.enter'),
                    cancelButtonText: this.$t('tip.cancel'),
                }).then(({ value }) => {
                    this.stopForging(value)
                });
            }
        },

        // 交易记录跳页
        changePage(page) {
            this.page=page;
            this.getTransactionByPubkey();
        },
        
        getTransactionByPubkey() {// 获取流水
            if(this.waterTimer) clearTimeout(this.waterTimer)
            let getWaterData = async ()=>{
                try {
                    let res = await getTransactionByPubkey({
                        ieType: this.ieType,//0支出1收入
                        pageNumber:this.page,
                        pageSize:10,
                        tokenName:this.token,
                        pubKey:this.pubKey,
                    })
                    if(res) {
                        // console.log(res.data)
                        // this.account=res.data.accountMap;
                        this.list = res.data.transactionList;
                        this.count = res.data.count;
                        // this.accounts=res.data.accounts;
                    }else {
                        this.accounts=[];
                    }
                    this.waterTimer = setTimeout(getWaterData,13000)
                }
                catch (e) {
                    console.log(e);
                }
            }
            getWaterData();
        },
        async FoundryMachineState(pwd) {// 查看锻造状态
            try {
                let res = await FoundryMachineState({
                    address:this.$route.params.address,
                })
                if(res.code==120) {
                    this.forgStatus=this.$t('tip.forging')
                    this.forgBtn=this.$t('tip.stopBtn')
                    this.isForg=true;
                }else if(res.code==121) {
                    this.forgStatus=this.$t('tip.stop')
                    this.forgBtn=this.$t('tip.forgBtn')
                    this.isForg=false;
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async startForging(pwd) {// 开始锻造
            try {
                let res = await startFoundryMachine({
                    address:this.$route.params.address,
                    passWord:pwd,
                })
                if(res&&res.code==116) {
                    this.forgStatus=this.$t('tip.forging')
                    this.forgBtn=this.$t('tip.stopBtn')
                    this.isForg=true;
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async stopForging(pwd) {// 停止锻造
            try {
                let res = await stopFoundryMachine({
                    address:this.$route.params.address,
                    passWord:pwd,
                })
                if(res && res.code == 118) {
                    this.forgStatus=this.$t('tip.stop')
                    this.forgBtn=this.$t('tip.forgBtn')
                    this.isForg=false;
                    // this.$message({
                    //     type: 'success',
                    //     message: this.$t('tip.code118')//锻造机停止成功
                    // });
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        add() {
            console.log(RandomNumBoth(1,12));
        },
        showBackup() {
            ipc.send('getSystem', 'ping')
            ipc.on('system',(event,arg) => {
                this.platform = arg
            })

            let arr=[];
            for(let i=0;i<10;i++) {
                arr.push(temp[RandomNumBoth(0,10)]);
            }
            this.str=arr.join(' ');
            this.isBackup = true;
            this.step=1;
            this.backupTxt='';
            this.backupPwd='';
            // this.dirname=__dirname;
            // 默认路径
            if(this.platform === 'win32') {
                this.dirname = path.resolve(__dirname,'./../../../../Accounts')
            }else {//darwin
                this.dirname = path.resolve(__dirname,'../../../../Accounts')
            }
            // 默认文件名字(无论存不存在都替代，不做文件存在判断)
            this.backupFileName = this.$route.params.address
        },
        hideBackup() {
            this.isBackup = false;
        },
        nextStep() {
            this.step=2;
        },
        selectPath() {
            // console.log(dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']}));
            this.dirname=dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']})[0]
        },
        async outPut() {// 获取账户信息
            if(this.dirname == ''){
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.fileLoadEmpty')//路径不能为空
                });
                return false;
            }
            if(/\\+|\/+|:+|\*+|\?+|"+|<+|>+|\|+/g.test(this.backupFileName)) {
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.notName')//不能使用特殊符号作为文件名
                });
                return false;
            }
            if(this.backupTxt!=this.str) {
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.code108')//助记词错误
                });
                return false;
            }
            try {
                let res = await exportWallet({
                    address:this.$route.params.address,
                    passWord:this.backupPwd,
                    mnemonic:this.backupTxt
                })
                if(res&& res.code==107) {
                    this.outPutEnter(res.data.jsonStr);
                }
                
            }
            catch (e) {
                this.$message({
                    type: 'warning',
                    message: this.$t('tip.fileLoadFail')//路径错误
                });
                console.log(e);
            }
        },
        outPutEnter(data) {
            // 创建文件夹
            if (!fs.existsSync(this.dirname)) {
                fs.mkdirSync(this.dirname);
            }
            // 创建文件
            if(this.platform === 'win32') {
                fs.writeFile(this.dirname+'\\'+this.backupFileName + '.ptn', JSON.stringify(data), (err)=> {
                    if (!err) {
                        this.$message({
                            type: 'success',
                            message: this.$t('tip.code107')
                        });
                        this.isBackup = false;
                    }else {
                        console.log(err)
                    } 
                })
            }else {
                fs.writeFile(this.dirname+'/'+this.backupFileName + '.ptn', JSON.stringify(data), (err)=> {
                    if (!err) {
                        this.$message({
                            type: 'success',
                            message: this.$t('tip.code107')
                        });
                        this.isBackup = false;
                    }else {
                        console.log(err)
                    } 
                })
            }
        }
    },
    computed: {
        getAccountM() {
            return this.$store.state.Counter.accountInfo.accounts;
        }
    },
    watch: {
        getAccountM: {
            handler: function(n,o) {
                if(n != undefined){
                    for (let item in n) {
                        if(n[item].address === this.$route.params.address) {
                            this.account = n[item];
                            this.pubKey = n[item].pubKey;
                            this.getTransactionByPubkey();
                        }
                    }
                }
            },
            immediate: true
        }
    }
}
</script>

<style lang='scss'>
    @import './account.scss';
</style>
