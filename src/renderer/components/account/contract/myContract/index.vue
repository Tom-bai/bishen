<template lang='pug'>
    .myContract
        header
            a.back(@click='backPage') << {{$t('contract.back')}}
            //- 我的合约列表
            h4
                i.iconfont.icon-jiaoseguanli
                span {{$t('contract.list')}}
            el-tabs(v-model="activeName" @tab-click="goPath")
                el-tab-pane(:label="$t('nav.exchange')" name="contractExcharge")
                el-tab-pane(:label="$t('nav.vote')" name="vote")
                el-tab-pane(:label="$t('othercoin.othercoin')" name="othercoin")
        router-view(style="padding-top:30px;")
</template>
<script>
    export default {
        name:'myContract',
        data(){
            return {
                activeName: ''
            }
        },
        mounted(){
            this.activeName = this.$route.path.replace(/\/home\/account\/contract\//,'');
        },
        methods:{
            backPage(){
                this.$router.push('/home/account');
            },
            goPath(tab, event){
                let path;
                this.activeName = tab.name;
                // console.log(tab.index ,event)
                this.$router.push('/home/account/contract/' + this.activeName);
            }
        }
    }
</script>
<style lang='scss' scoped>
@import '../../../public.scss';
    .myContract {
        h4 {
            padding-bottom: 16px;
            color:#484E64;
            font-size: 28px;
            i {
                font-size: 28px;
                vertical-align: baseline;
            }
            span {
                font-size: 22px;
                padding-left: 20px;
            }
        }
        header{
            padding: 50px 40px 0 50px;
            box-sizing: border-box;
        }
        .back {
            cursor: pointer;
            font-size: 14px;
            margin-bottom: 20px;
            display: inline-block;
            :hover {
                color:$theme-color;
            }
        }
    }
</style>