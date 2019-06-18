<template lang='pug'>
    .contractDetail
        el-row.contract-box(:gutter='24')
            el-table(:data='list' @row-click='showInfo')
                el-table-column(:label="$t('exchange.accountaddr')" prop='address')
                el-table-column(:label="$t('exchange.contractaddr')" prop='contractAddress')
                el-table-column(:label="$t('exchange.buy')")
                    template(slot-scope='scope')
                        span {{scope.row.fromVal}} 
                        b {{scope.row.fromCoinName}}
                el-table-column(:label="$t('exchange.sell')" )
                    template(slot-scope='scope')
                        span {{scope.row.toVal}} 
                        b {{scope.row.toCoinName}}
                el-table-column(:label="$t('exchange.date')" prop='date')
                el-table-column(:label="$t('exchange.operating')")
                    template(slot-scope='scope')
                        el-button(size='mini' type='primary' @click.native.stop='exchange(scope.row.contractAddress)' v-if='scope.row.contractState==0') {{$t("exchange.undo")}}
                        span(v-if='scope.row.contractState!=0') {{$t('contractType.state'+scope.row.contractState)}}
        el-pagination(class="elPage" background layout="prev, pager, next" :total='count' :pageSize='5' @current-change='gopage')
        .ex-mask(v-if='maskShow')
            //- 兑换详情
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
import { myContract,cancelContract,getContractDetails } from '@/http/index.js'

export default {
    created() {
        // 获取我的合约第一页
        this.myContract(1);
        //  定时刷新
        this.timer = setInterval(()=>{
            this.myContract(this.page);
        },5000)
    },
    destroyed() {
        clearInterval(this.timer)
    },
    data() {
        return {
            list: [],
            count: 0,
            page: 1,
            timer:null,
            maskShow: false,
            contract:{},
        }
    },
    methods: {
        showInfo(row, event, column) { // 获取详情
            this.maskShow = true;
            this.getContractDetails(row.contractAddress);
        },
        changeMask(val) { // 详情显示
            this.maskShow = val;
        },
        backPage() { // 返回上一页
            this.$router.go(-1)
        },
        gopage(page) { // 翻页
            this.page = page;
            this.myContract(this.page);
        },
        exchange(address) { // 兑换合约
            this.$prompt(this.$t('account.pwdPlaceholder'), 'Tip', {
                inputType:'password',
                confirmButtonText: this.$t('account.enter'),
                cancelButtonText: this.$t('account.cancel'),
            }).then(({ value }) => {
                this.cancelContract(address,value)
            })
        },
        async getContractDetails( addr ) {// 获取兑换详请
            try {
                let res = await getContractDetails({
                    contractAddress: addr,
                })
                if(res) {
                    this.contract = res.data;
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async myContract() {// 获取我的合约列表
            try {
                let res = await myContract({
                    pageNumber:this.page,
                    pageSize:5,
                    contractType: 1,//合约类型
                })
                if(res) {
                    this.list = res.data.transMap
                    this.count = res.data.count
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async cancelContract(add,pwd) {// 撤销合约
            try {
                let res = await cancelContract({
                    contractAddress: add,
                    password: pwd,
                })
                this.myContract();
            }
            catch (e) {
                console.log(e);
            }
        },
    }
}
</script>

<style lang='scss' scoped>
    @import './contract.scss';
</style>
