<template lang='pug'>
    .vote
        h4
            i.iconfont.icon-jiaoseguanli
            span {{$t('vote.vote')}}
        //- 兑换账户
        .wallet
            el-select(v-model='address' style='width:100%' :placeholder='$t("transaction.select")')
                el-option(v-for="item in myAddress"
                :key="item.address"
                :label="item.address"
                :value="item.address")
        .options {{$t('vote.voteState')}}：
            el-select(v-model='options.state' style='width:120px;' :placeholder='$t("transaction.select")' size="mini")
                el-option(
                :label="$t('vote.notFinish')"
                value="0")
                el-option(
                :label="$t('vote.finished')"
                value="1")
            el-button(style='margin-left:20px;' size='mini' type='primary' @click='exSearch') {{$t('exchange.search')}}
        el-table(:data='list' type='index' v-loading='loading' ref='list')
            el-table-column(:label='$t("vote.votePro")' prop='topic')
            el-table-column(:label='$t("vote.state")' prop='contractState')
                template(slot-scope='scope') {{ContractState(scope.row.contractState)}}
            el-table-column(:label='$t("vote.operating")')
                template(slot-scope='scope')
                    el-button(v-if="scope.row.contractState==0" @click.native.stop="showInfo( scope.$index, scope.row)" size='mini' type='primary') {{$t('vote.vote')}}
                    el-button(v-if="scope.row.contractState==1" @click.native.stop="showInfo( scope.$index, scope.row)" size='mini' type='primary') {{$t('vote.detail')}}
            el-table-column(type="expand" width="20")
                template(slot-scope="scope" class="expand_div" v-if="scope.row.contractState==0 || scope.row.contractState==1")
                    //- 未完结显示
                    div(v-if="scope.row.contractState==0")
                        el-form(ref="form" :model="form" label-width="80px")
                            el-form-item(:label="$t('vote.option')" props="noEmpty")
                                //- 单选
                                div(v-for="(item,index) in scope.row.items" :key="index")
                                    el-radio(v-model="form.option" :label="item")
                                //- 多选
                                //- el-checkbox-group(v-model="form.option")
                                //-     el-checkbox(:label="lihead(index)+'. '+item.label" :true-label="item.val" v-for="(item,index) in scope.row.items")
                            el-form-item(:label="$t('vote.fee')") {{scope.row.fee}} PTN
                            el-form-item(label=" ")
                                el-button(size="mini" @click.native.stop="submit(scope.$index, scope.row)" :disable="!isAble" v-text="submitText") 
                    //- 已完结显示
                    div(v-if="scope.row.contractState==1")
                        .row
                            .label {{$t('vote.ConAddr')}}：
                            span {{ scope.row.contractAddress }}
                        .row
                            .label {{$t('vote.initiator')}}：
                            span {{ scope.row.sponsor }}
                        .row
                            .label {{$t('vote.option')}}：
                            ul
                                li(v-for="(item,key,index) in scope.row.items" :key="index")
                                    //- i {{key}}
                                    em {{key}}
                                    div(class="line")
                                        div(class="line_active" :style="'width:'+ (item.votesProportion*100) +'%;'")
                                    span(@click="showVoterList(key,item)" style="cursor:pointer;") {{ item.votesCount +' '+ $t('vote.ticket') }}
                        .row
                            .label {{$t('vote.condition')}}：
                            span {{ scope.row.deadLine }}
                        .row
                            .label {{$t('vote.voters')}}：
                            span {{ scope.row.paticipateNumber }}
        el-pagination(class="elPage" background layout="prev, pager, next" :current-page='page' :total='count' :pageSize='10' @current-change='gopage')

        //- 显示参与投票的钱包的列表
        el-dialog(:title="$t('vote.addrText0')" :visible.sync="dialogVoterListVisible")
            .voters_list
                .item(v-for="(item,index) in votersList" :key="index") {{item}}
            el-pagination(class="elPage" background layout="prev, pager, next" :current-page='VL_Page' :total='VL_Count' :pageSize='10' @current-change='gopage_VL')
</template>
<script>
import { BigNumber } from 'bignumber.js';
import {getAllAccount,marketPlace,conVotesList,vote} from '@/http/index.js'
    export default {
        name:'vote',
        data(){
            return {
                dataTimer: null,
                // timer: null,
                isAble: true,
                // timeNum: 10,
                myAddress: [],
                address: '',
                options: {
                    state:'0'
                },
                use:{
                    state: ''
                },
                list: [],
                activeIndex: -1,
                activeRow: {},
                form: {
                    option: ''
                },
                loading: false,
                page: 1,
                count: 0,

                dialogVoterListVisible: false,
                votersList: [],
                activeKey: '',
                VL_loading: false,
                VL_Page: 1,
                VL_Count: 0,
            }
        },
        computed: {
            submitText(){
                return this.$t('vote.confirm')
            }
        },
        mounted(){
            this.getAllAccount();
            this.exSearch();
            this.dataTimer = setInterval(this.marketPlace,10000);
        },
        beforeDestroy() {
            if(this.dataTimer){
                clearInterval(this.dataTimer);
            }
        },
        methods:{
            // 获取账户信息
            async getAllAccount() {
                try {
                    let res = await getAllAccount()
                    if(res) {
                        // console.log(res)
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
            // 搜索按钮
            exSearch(){
                this.loading = true;
                this.use = this.options;
                this.activeIndex = -1;
                this.page = 1;
                this.count = 0;
                this.list = [];
                this.marketPlace();
            },

            // 获取市场的投票列表
            async marketPlace() {
                try {
                    let res = await marketPlace({
                        pageNumber:this.page,
                        pageSize: 10,
                        sell:'',
                        buy:'',
                        contractType:2,
                        contractState: this.use.state,//1已完成，0未完成
                    })
                    if(res) {
                        this.list = res.data.transMap;
                        this.count = res.data.count;
                        this.loading = false;
                        // this.$refs.list.toggleRowExpansion(this.activeRow, true);//不知道为啥没效果
                    }
                }
                catch (e) {
                    this.loading = false;
                    console.log(e);
                }
                
            },

            // 展开当行
            async showInfo(index, rowData){
                let shouldOpen;
                this.form.option = '';
                // 关闭所有
                for (let i = 0; i < this.list.length; i++) {
                    if (this.list[i] !== rowData) {
                        this.$refs.list.toggleRowExpansion(this.list[i], false);
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
                this.$refs.list.toggleRowExpansion(rowData, shouldOpen);
                if(shouldOpen){
                    if(this.dataTimer) clearInterval(this.dataTimer);
                }else {
                    this.dataTimer = setInterval(this.marketPlace,10000);
                }
            },

            // 查看参与投票的钱包
            async showVoterList(key,item){
                if(item && item.votesCount<1) return
                if(key) this.activeKey = key;
                this.VL_loading = true;
                this.votersList = [];
                this.dialogVoterListVisible = true;
                try {
                    let res = await conVotesList({
                        pageNumber: this.VL_Page,//页码
                        pageSize: 10,//每页记录数
                        contractAddress: this.activeRow.contractAddress || this.activeVoteAddr,//合约地址
                        items: this.activeKey//'A.xxx'
                    })
                    if(res) {
                        this.votersList = res.data.addressList;
                        this.VL_Count = res.data.count;
                        this.VL_loading = false;
                    }
                }catch(e){
                    this.VL_loading = false;
                }
            },

            // 确认投票
            async submit(index,row){
                // 判断版本
                let isMatch = await this.IS_VER_MATCH();
                if(!isMatch) return false
                // 按钮冷却
                if(!this.isAble) return false
                // 逻辑代码
                this.$prompt(this.$t('vote.password'), this.$t('vote.prompt'), {
                    confirmButtonText: this.$t('vote.certain'),
                    cancelButtonText: this.$t('vote.cancel'),
                    inputType: 'password'
                    // inputPattern: //,
                    // inputErrorMessage: '密码格式不正确'
                }).then(async ({ value }) => {
                    this.isAble = false;
                    try {
                        let res = await vote({
                            contractAddress: row.contractAddress,//投票合约地址
                            password: value,//钱包密码
                            fromAddress: this.address,//我的钱包地址
                            chose: this.form.option,//所选的选项
                        })
                        if(res) {
                            if(res.code == 145){
                                // if(this.timer) clearInterval(this.timer);
                                // this.timer = setInterval(()=>{
                                //     if(this.timeNum>0){
                                //         this.timeNum--;
                                //     } else {
                                //         this.timeNum = 10;
                                //         this.isAble = true;
                                //     }
                                // },1000)
                                this.marketPlace();
                            }
                            this.isAble = true;
                            // this.marketPlace();//没有轮询，不请求
                        }
                    }catch(e){
                        this.isAble = true;
                        console.log(e)
                    }
                }).catch(() => {
                    
                });
            },

            // 跳页
            gopage(page){
                this.page = page;
                this.loading = true;
                this.marketPlace();
            },
            // 参与投票的地址列表 跳页
            gopage_VL(page){
                this.VL_Page = page;
                this.VL_loading = true;
                this.showVoterList();
            },

            lihead(i){
                let word = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                if(i-0 == i)
                    return word[i]
            },

            // 状态
            ContractState(state){
                if(state == 0) return this.$t('vote.notFinish')
                if(state == 1) return this.$t('vote.finished')
                if(state == 2) return this.$t('vote.canceled')
                return state
            },

            // 投票选项占比
            lineW(num){
                return BigNumber(num).multipliedBy(100)
            }
        }
    }
</script>
<style lang='scss' scoped>
    @import './vote.scss';
</style>