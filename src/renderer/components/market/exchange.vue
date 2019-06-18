<template lang='pug'>
    .exchange
        el-row.exchange-box(:gutter='20') 
            el-col(:span='24')
                h4 
                    i.iconfont.icon-jiaoseguanli
                    span {{$t('exchange.account')}}
                //- 兑换账户
                .wallet
                    el-select(v-model='address' style='width:100%' :placeholder='$t("transaction.select")')
                        el-option(v-for="item in myAddress"
                        :key="item.address"
                        :label="item.address"
                        :value="item.address")
                //- 条件搜索
                .search
                    label {{$t("exchange.fromToken")}}：
                    el-input(placeholder='TokenName' style='width:100px;' size='mini' v-model='fromToken')
                    label {{$t("exchange.toToken")}}：
                    el-input(placeholder='TokenName' style='width:100px;' size='mini' v-model='toToken')
                    label {{$t("exchange.exState")}}：
                    el-select(size='mini' style='width:100px' v-model='exState')
                        el-option(:label='$t("exchange.noEx")' value='0')
                        el-option(:label='$t("exchange.success")' value='1')
                    el-button(style='margin-left:20px;' size='mini' type='primary' @click='exSearch') {{$t('exchange.search')}}
        el-row.exchange-box(:gutter='24') 
            el-table(:data='list' type='index' @row-click='showInfo' v-loading='loading')
                el-table-column(:label='$t("exchange.accountaddr")' prop='address')
                el-table-column(:label='$t("exchange.contractaddr")' prop='contractAddress')
                el-table-column(:label='$t("exchange.buy")')
                    template(slot-scope='scope')
                        span {{scope.row.fromVal}} 
                        b {{scope.row.fromCoinName}}
                el-table-column(:label='$t("exchange.sell")' prop='fromVal')
                    template(slot-scope='scope')
                        span {{scope.row.toVal}} 
                        b {{scope.row.toCoinName}}
                el-table-column(:label='$t("exchange.date")' prop='date')
                el-table-column(:label='$t("exchange.operating")')
                    template(slot-scope='scope')
                        el-button(size='mini' type='primary' @click.native.stop='exchangeBox(scope.row.contractAddress,scope.$index)' v-if='scope.row.contractState==0').exc {{$t("exchange.exchange")}}
                        span(v-if='scope.row.contractState==1') {{$t("exchange.success")}}
                        span(v-if='scope.row.contractState==2') {{$t("exchange.cancel")}}
        el-pagination(background layout="prev, pager, next" :current-page='page' :total='count' :pageSize='5' @current-change='gopage')
        .ex-mask(v-if='maskShow')
            .ex-mask-box
                h4.title {{$t("exchange.detail")}}
                    .close(@click='changeMask(false)') ×
                ul.detail
                    el-row
                        el-col(:span='5').lab {{$t("exchange.state1")}}
                        el-col(:span='19').addr {{$t('contractType.state'+contract.contractState)}}
                    el-row
                        el-col(:span='5').lab {{$t("exchange.accountaddr")}}
                        el-col(:span='19').addr {{contract.transFrom}}
                    el-row
                        el-col(:span='5').lab {{$t("exchange.contractaddr")}}
                        el-col(:span='19').addr {{contract.transTo}}
                    el-row
                        el-col(:span='5').lab {{$t("exchange.buy")}}
                        el-col(:span='19').addr {{contract.fromCoin + contract.fromType}}
                    el-row
                        el-col(:span='5').lab {{$t("exchange.sell")}}
                        el-col(:span='19').addr {{contract.toCoin + contract.toType}}
</template>

<script>
import {marketPlace,getAllAccount,conTransaction,getContractDetails} from '@/http/index.js'
export default {
    mounted() {
        this.marketPlace()
        this.getAllAccount()
        this.timer = setInterval(()=> {
            this.marketPlace()
        },10000)
    },
    destroyed() {
        clearInterval(this.timer);
        this.timer = null;
    },
    data() {
        return {
            list: [],
            address:'',
            myAddress:[],
            count:0,
            page: 1,
            maskShow: false,
            contract:{},
            exchange:0,
            fromToken:null,
            toToken:null,
            exState:'0',
            timer:null,
            loading:true,
            index:null
        }
    },
    methods: {
        exSearch() {
            this.gopage(1);
        },
        changeMask(val) {
            this.maskShow = val;
        },
        showInfo(row, event, column) {
            this.maskShow = true;
            this.getContractDetails(row.contractAddress);
        },
        gopage(page) {
            this.page = page;
            this.loading = true;
            this.marketPlace()
        },
        exchangeBox(addr,index) {
            this.$prompt(this.$t('account.pwdPlaceholder'), 'Tip', {
                inputType:'text',
                confirmButtonText: this.$t('account.enter'),
                cancelButtonText: this.$t('account.cancel'),
                inputType:'password'
            }).then(({ value }) => {
                this.conTransaction(addr,this.address,value,index)
            })
        },
        async getContractDetails( addr ) {// 获取账户信息
            try {
                let res = await getContractDetails({
                    contractAddress: addr,
                })
                if(res) {
                    this.contract = res.data; 
                    // console.log(res.data);
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async marketPlace() {// 获取账户信息
            try {
                let res = await marketPlace({
                    pageNumber:this.page,
                    pageSize: 5,
                    sell:this.fromToken||'',
                    buy:this.toToken||'',
                    contractState:this.exState||0,
                    contractType: 1
                })
                if(res) {
                    this.list = res.data.transMap;
                    this.count = res.data.count;
                    this.loading = false;
                    if(this.index !== null) {
                        document.querySelectorAll('.exc')[this.index].disabled = false;
                        document.querySelectorAll('.exc')[this.index].style.cssText = "";
                        this.index = null
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async getAllAccount() {// 获取账户信息
            try {
                let res = await getAllAccount()
                if(res) {
                    // console.log(res)
                    this.myAddress=res.data.accounts;
                    this.address=res.data.accounts[0].address;
                    // this.getTokenListByAddress();
                }else {
                    this.myAddress=[];
                } 
            }
            catch (e) {
                console.log(e);
            }
        },
        async conTransaction(contract,addr,pwd,index) {// 兑换接口
            // 判断版本
            let isMatch = await this.IS_VER_MATCH();
            if(!isMatch) return false
            // 逻辑代码
            try {
                let res = await conTransaction({
                    contractAddress: contract,
                    fromAddress: addr,
                    pwd
                })
                if(res) {
                    // this.$message({
                    //     type: 'success',
                    //     message: this.$t('exchange.success')
                    // });
                    // this.marketPlace(this.page);
                    document.querySelectorAll('.exc')[index].disabled = true;
                    document.querySelectorAll('.exc')[index].style.cssText = "background-color:#999 !important;cursor:not-allowed";
                    this.index = index;
                }
            }
            catch (e) {
                console.log(e);
            }
        },
    }
}
</script>

<style lang='scss' scoped>
@import './exchange.scss';
</style>
