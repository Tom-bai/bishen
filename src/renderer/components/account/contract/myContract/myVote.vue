<template lang='pug'>
    .myVote
        el-table(:data='list' type='index' v-loading='loading' ref='list')
            el-table-column(:label='$t("vote.votePro")' prop='topic')
            el-table-column(:label='$t("vote.state")' prop='contractState')
                template(slot-scope='scope') {{ContractState(scope.row.contractState)}}
            el-table-column(:label='$t("vote.operating")')
                template(slot-scope='scope')
                    el-button(@click.native.stop="showInfo( scope.$index, scope.row)" size='mini' type='primary') {{$t('vote.detail')}}
            el-table-column(type="expand" width="20")
                template(slot-scope="scope" class="expand_div")
                    .row
                        .label {{$t('vote.ConAddr')}}：
                        span {{ scope.row.contractAddress }}
                    .row
                        .label {{$t('vote.initiator')}}：
                        span {{ scope.row.sponsor }}
                    .row
                        .label {{$t('vote.option')}}：
                        ul
                            li(v-for="(item,key,index) in scope.row.items")
                                //- i {{key}}
                                em {{key}}
                                div(class="line")
                                    div(class="line_active" :style="'width:'+ item.votesProportion*100 +'%;'")
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
                .item(v-for="item in votersList") {{item}}
            el-pagination(class="elPage" background layout="prev, pager, next" :current-page='VL_Page' :total='VL_Count' :pageSize='10' @current-change='gopage_VL')
</template>
<script>
import { BigNumber } from 'bignumber.js';
import { myContract, conVotesList } from '@/http/index.js'
    export default {
        name:'vote',
        data(){
            return {
                timer: null,
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
        mounted(){
            this.myContract();
            this.timer = setInterval(this.myContract,10000);
        },
        beforeDestroy() {
            if(this.timer){
                clearInterval(this.timer);
            }
        },
        methods:{
            // 获取我发布的投票列表
            async myContract() {
                try {
                    let res = await myContract({
                        pageNumber:this.page,
                        pageSize: 10,
                        contractType: 2,//合约类型
                    })
                    if(res) {
                        this.list = res.data.transMap;
                        this.count = res.data.count;
                        this.loading = false;
                        // if(JSON.stringify(this.activeRow)!='{}')
                        //     this.$refs.list.toggleRowExpansion(this.activeRow, true);//不知道为啥没效果
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
                    if(this.timer) clearInterval(this.timer);
                }else {
                    this.timer = setInterval(this.myContract,10000);
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

            // 跳页
            gopage(page){
                this.page = page;
                this.loading = true;
                this.myContract();
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
        },
        watch:{
            dialogVoterListVisible: function(n,o){
                if(n) {//打开弹层时
                    // if(this.timer){
                    //     clearInterval(this.timer);
                    // }
                }else {
                    this.myContract();
                    // this.timer = setInterval(this.myContract,10000);
                }
            }
        }
    }
</script>
<style lang='scss' scoped>
@import './../../../public.scss';
    $linh: 40px;
    .myVote {
        padding: 50px 40px 40px 50px;
    }
    .row {
        margin-bottom: 22px;
        .label {
            display: inline-block;
            width: 150px;
            padding-right: 12px;
            text-align: right;
            line-height: $linh;
            &+span {
                display: inline-block;
            }
            &+ul {
                display: inline-block;
                vertical-align: top;
                li {
                    // display: table-column;
                    display: table-row;
                    border-bottom-width: 20px;
                    font-size: 14px;
                    line-height: $linh;
                    i {
                        display: table-cell;
                        padding-right: 5px;
                    }
                    em {
                        display: table-cell;
                        padding-right: 15px;
                    }
                    .line {
                        display: table-cell;
                        width: 200px;
                        position: relative;
                        &_active {
                            height: 10px;
                            width: 0;
                            transition: all 0.3s;
                            border-radius: 5px;
                            background-color: $theme-color;
                        }
                    }
                    span {
                        display: table-cell;
                        padding-left: 5px;
                    }
                }
            }
        }
    }
</style>