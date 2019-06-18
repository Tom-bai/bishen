<template lang='pug'>
    .blocklist
        .blocklist-box
            .blocklist-box-tit {{$t('blocklist.blockinfo')+':'+height}}
                span.close
                    slot
            .blocklist-box-content
                .blocklist-box-title(style='margin-top:0;' v-if='blockInfo.date') {{$t('blocklist.blockinfo')}}
                .blocklist-box-top(v-if='blockInfo.date')
                    el-row
                        el-col(:span='6') {{$t('blocklist.date')}}
                        el-col(:span='18') {{blockInfo.date}}
                    el-row(v-for='(item,key,index) in blockInfo.tokenTotalAmount' :key="index")
                        el-col(:span='6') {{key+$t('blocklist.nums')}}
                        el-col(:span='18') {{item}}
                    el-row
                        el-col(:span='6') {{$t('blocklist.fee')}}
                        el-col(:span='18') {{blockInfo.totalFee}}
                    el-row
                        el-col(:span='6') {{$t('blocklist.producer')}}
                        el-col(:span='18') {{blockInfo.foundryPublicKey}}
                    el-row
                        el-col(:span='6') {{$t('blocklist.height')}}
                        el-col(:span='18') {{blockInfo.blockHeight}}
                    el-row
                        el-col(:span='6') {{$t('blocklist.prev')}}
                        el-col(:span='18') {{blockInfo.hashPrevBlock}}
                    el-row
                        el-col(:span='6') {{$t('blocklist.now')}}
                        el-col(:span='18') {{blockInfo.hashBlock}}
                    el-row
                        el-col(:span='6') {{$t('blocklist.sign')}}
                        el-col(:span='18') {{blockInfo.blockSignature}}
                    el-row
                        el-col(:span='6') {{$t('blocklist.size')}}
                        el-col(:span='18') {{blockInfo.blockSize}}

                //- 流水
                .blocklist-box-bottom(v-for='item in tranList')
                    .blocklist-box-title {{$t('blocklist.Bill')}}

                    el-row
                        el-col(:span='6') {{$t('blocklist.confirm')}} 
                        el-col(:span='18') {{item.confirm}}

                    el-row
                        el-col(:span='6') {{$t('blocklist.type')}}
                        el-col(:span='18') {{TransType(item.transType,item.contractType)}}

                    el-row
                        el-col(:span='6') {{$t('blocklist.send')}}
                        el-col(:span='18') {{item.from}}

                    el-row(v-if="canDataShow('to',item.transType)")
                        el-col(:span='6') {{$t('blocklist.rec')}}
                        el-col(:span='18') {{item.to}}

                    el-row(v-if="canDataShow('contractAddress',item.transType)")
                        el-col(:span='6') {{$t('blocklist.redemptionAddr')}}
                        el-col(:span='18') {{item.contractAddress}}

                    el-row(v-if="canDataShow('value',item.transType)")
                        el-col(:span='6') {{$t('blocklist.nums')}}
                        el-col(:span='18') {{item.value}}

                    el-row(v-if="canDataShow('fee',item.transType)")
                        el-col(:span='6') {{$t('blocklist.theFee')}}
                        el-col(:span='18') {{item.fee}}

                    el-row(v-if="canDataShow('tokenName',item.transType)")
                        el-col(:span='6') {{$t('blocklist.name')}}
                        el-col(:span='18') {{item.tokenName}}

                    el-row(v-if="canDataShow('remark',item.transType)")
                        el-col(:span='6') {{$t('blocklist.remarks')}}
                        el-col(:span='18') {{item.remark}}

                    el-row(v-if="canDataShow('topic',item.transType)")
                        el-col(:span='6') {{$t('blocklist.theme')}}
                        el-col(:span='18') {{item.topic}}

                    el-row(v-if="canDataShow('item',item.transType)")
                        el-col(:span='6') {{$t('blocklist.Option')}}
                        el-col(:span='18') {{item.item}}

                    el-row(v-if="canDataShow('txHash',item.transType)")
                        el-col(:span='6') {{$t('blocklist.hash')}}
                        el-col(:span='18') 
                            el-popover(placement="top"
                                popper-class="elPopClass"
                                width="370"
                                trigger="hover"
                                :content="item.txHash")
                                span(slot="reference" v-clipboard:copy="item.txHash" style="display:inline-block;width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;") {{item.txHash}}
                    el-row
                        el-col(:span='6') {{$t('blocklist.time')}}
                        el-col(:span='18') {{item.date}}

</template>

<script>
import { getBlockInfoByBlockHeightDealWithData,getTransactionByHash } from '@/http/index.js'
export default {
    mounted() {
        // 根据props是否传递了hash来进行获取交易信息
        if(this.hash) {
            this.getTransactionByHash()
        }else {
            this.getBlockInfoByBlockHeightDealWithData()
        }
    },
    props:['height','hash'],
    data() {
        return {
            blockInfo:{},
            tranList:[],
        }
    },
    methods:{
        async getBlockInfoByBlockHeightDealWithData() {// 根据区块高度获取区块详细信息
            try {
                let res = await getBlockInfoByBlockHeightDealWithData({
                    blockHeight: this.height
                })
                if(res) {
                    this.blockInfo = res.data.block;
                    this.tranList = res.data.block.blockTransactions;
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async getTransactionByHash() {// 根据区块hash获取交易信息
            try {
                let res = await getTransactionByHash({
                    hash: this.hash
                })
                if(res) {
                    this.tranList = res.data.transactions;
                }
            }
            catch (e) {
                console.log(e);
            }
        },

        TransType(t_type,c_type) {
            if(c_type == 4) return this.$t('blocklist.type13')//其他合约
            if(t_type == 0 && c_type == 0) return this.$t('blocklist.type1')//转账交易
            if(t_type == 1 && c_type == 0) return this.$t('blocklist.type2')//发行代币
            if(t_type == 1 && c_type == 3) return this.$t('blocklist.type2')//发行代币
            if(t_type == 2 && c_type == 0) return this.$t('blocklist.type3')//挖矿奖励
            if(t_type == 3 && c_type == 1) return this.$t('blocklist.type4')//挂单合约
            if(t_type == 3 && c_type == 2) return this.$t('blocklist.type5')//投票合约
            if(t_type == 3 && c_type == 3) return this.$t('blocklist.type6')//代币合约
            if(t_type == 4 && c_type == 1) return this.$t('blocklist.type7')//挂单合约资金
            if(t_type == 4 && c_type == 2) return this.$t('blocklist.type8')//投票合约资金
            if(t_type == 4 && c_type == 3) return this.$t('blocklist.type9')//代币合约资金
            if(t_type == 5 && c_type == 0) return this.$t('blocklist.type10')//兑换交易
            if(t_type == 6 && c_type == 0) return this.$t('blocklist.type11')//取消挂单
            if(t_type == 7 && c_type == 2) return this.$t('blocklist.type12')//投票选项
            
            return 't_type:'+t_type +',c_type:'+ c_type
        },

        canDataShow(key,t_type){
            let reg = new RegExp(t_type);
            // if(key == 'confirm') return true;
            // if(key == 类型) return true;
            // if(key == 'from') return true;
            if(key == 'to') return reg.test('012');//transType = 0 或 1 或 2 的时候显示,下面同理
            if(key == 'contractAddress') return reg.test('34567');
            if(key == 'value') return reg.test('0124');
            if(key == 'fee') return reg.test('012');
            if(key == 'tokenName') return reg.test('012');
            if(key == 'remark') return reg.test('012');
            if(key == 'txHash') return reg.test('012');
            if(key == 'topic') return reg.test('7');
            if(key == 'item') return reg.test('7');
            // if(key == 'date') return true;
        }
    },
}
</script>

<style lang='scss'>
    @import './blocklist';
</style>
