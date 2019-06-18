<template lang="pug">
    .otherCoin
        el-table(:data='list' type='index' v-loading='loading' ref='list')
            el-table-column(:label='$t("othercoin.issuer")' prop='tokenIssuer')
            el-table-column(:label='$t("othercoin.coinAddr")' prop='contractAddress')
            el-table-column(:label='$t("othercoin.othercoinName")' prop='tokenName')
            el-table-column(:label='$t("othercoin.circulation")' prop='tokenNum')
            el-table-column(:label='$t("othercoin.precision")' prop='tokenDecimal')
            el-table-column(:label='$t("othercoin.time")' prop='data')
            el-table-column(:label='$t("othercoin.operating")')
                template(slot-scope='scope')
                    el-button(v-if="scope.row.contractState==0" @click.native.stop="issue(scope.row)" size='mini' type="primary") {{$t('othercoin.issue')}}
                    span(v-if="scope.row.contractState==1") {{$t('othercoin.finished')}}
        el-pagination(class="elPage" background layout="prev, pager, next" :current-page='page' :total='count' :pageSize='10' @current-change='gopage')
</template>
<script>
import { myContract,createToken } from '@/http/index.js'
    export default {
        name:'otherCoin',
        data(){
            return {
                timer: null,
                list: [],
                loading: false,
                page: 1,
                count: 0,
            }
        },
        mounted(){
            this.onloop();
        },
        beforeDestroy() {
            if(this.timer) clearTimeout(this.timer);
        },
        methods:{
            // 轮询
            async onloop(){
                await this.myContract();
                this.timer = setTimeout(this.onloop,10000);
            },
            // 获取发行的代币
            async myContract() {
                this.loading = true;
                try {
                    let res = await myContract({
                        pageNumber:this.page,
                        pageSize: 10,
                        contractType: 3,//合约类型
                    })
                    if(res) {
                        this.list = res.data.transMap;
                        this.count = res.data.count;
                        this.loading = false;
                    }
                }
                catch (e) {
                    this.loading = false;
                    console.log(e);
                }
                
            },

            // 提交按钮
            issue(row) {
                if(this.timer) clearTimeout(this.timer);
                this.$prompt(this.$t('account.password'), this.$t('vote.prompt'), {
                    confirmButtonText: this.$t('account.enter'),
                    cancelButtonText: this.$t('account.cancel'),
                    inputType: 'password'
                    // inputPattern: //,
                    // inputErrorMessage: '密码格式不正确'
                }).then(async ({ value }) => {
                    try {
                        let res = await createToken({
                            contractAddress: row.contractAddress,//合约地址
                            password: value,//密码
                        })
                        // if(res&&res.code==122){
                        //     ElementUI.Message({
                        //         message:this.$t('tip.code122'),
                        //         type: 'success'
                        //     })
                        // }
                        this.onloop();
                    }catch(e){
                        console.log(e);
                        this.onloop();
                    }
                }).catch((err)=>{
                    this.onloop();
                })
                
            },

            // 跳页
            gopage(page){
                this.page = page;
                this.onloop();
            },
        }
    }
</script>
<style lang='scss' scoped>
    @import './../../../public.scss';
    .otherCoin {
        padding: 50px 40px 40px 50px;
    }
</style>