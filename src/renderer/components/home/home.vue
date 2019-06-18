<template lang='pug'>
    .home
        pub-nav(:height='navHeight')
            .data(v-if='showNavData')
                .desc {{$t('loading.amount')}}
                h4 {{$store.state.Counter.accountInfo.totalBalance||0}}
                p {{$store.state.Counter.nowToken}}
        router-view     
</template>

<script>
import pubNav from './public/nav'
import { getTotalBalance } from '@/http/index.js'
export default {
    beforeRouteUpdate(to, from, next) { // 路由更新事件
        if (to.path === '/home/blocks') { // 区块页面不执行时钟并把总额隐藏
            clearInterval(this.timer);
            this.showNavData=false;
        }else if(to.path.indexOf('/home/api') != -1) { // api页面不执行时钟并把总额隐藏
            clearInterval(this.timer);
            this.showNavData=false;
        }else if(to.path.indexOf('/home/account/contractExcharge') != -1) { // 合约页面不执行时钟并把总额隐藏
            clearInterval(this.timer);
            this.showNavData=false;
        }else if(to.path.indexOf('/home/market') != -1) { // 兑换页面不执行时钟并把总额隐藏
            clearInterval(this.timer);
            this.showNavData=false;
        }else if(to.path.indexOf('/home/transaction') != -1) { // 交易页面不执行时钟并把总额隐藏
            clearInterval(this.timer);
            this.showNavData=false;
        }else {  // 其他页面显示总额并执行轮询获取总额
            this.showNavData=true;
            if(to.params.tokenName) {
                this.token=to.params.tokenName;
            }else {
                this.token='ptn';
            }
            this.getTotalBalance();
            clearInterval(this.timer);
            this.timer=setInterval(()=>{
                this.getTotalBalance();
            },5000)
        }
        next();
    },
    destroyed() {
        clearInterval(this.timer);
        this.timer=null;
    },
    components: {
        pubNav
    },
    data() {
        return {
            navHeight:60,
            totalNum:null,
            timer:null,
            token:'ptn',
            showNavData:false
        }
    },
    methods: {
        async getTotalBalance() {// 获取总额和账户信息
            try {
                let res = await getTotalBalance({
                    tokenName: this.token
                })
                if(res&& res.code==100) {
                    this.$store.commit('UPDATE_ACCOUNTINFO',res.data);
                    this.totalNum=res.data.totalBalance;
                }
            }
            catch (e) {
                console.log(e);
            }
        },
    },
}
</script>

<style lang='scss'>
    .home {
        height: 100%;
    }
    .data {
        text-align: center;
        color:#fff;
        padding: 40px;
        .desc {
            line-height: 34px;
            font-size: 22px;
        }
        h4 {
            font-size: 34px;
            font-weight: 700;
            line-height: 60px;
        }
        p {
            font-size: 22px;
            line-height: 40px;
        }
    }
</style>
