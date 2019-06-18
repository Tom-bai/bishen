<template lang='pug'>
    .api
        el-row
            el-col(:span="5").left
                el-menu(background-color="#1e6bd4"
                        text-color="#fff"
                        active-text-color="#ffd04b"
                        :router="true")
                    
                        el-menu-item(index="/home/api/create") 
                            i.el-icon-star-off
                            span {{$t('api.created')}}
                        el-menu-item(index="/home/api/getAccountInfo")
                            i.el-icon-star-off 
                            span {{$t('api.account')}}
                        el-menu-item(index="/home/api/transferAccounts") 
                            i.el-icon-star-off 
                            span {{$t('api.transfer')}}
                        el-menu-item(index="/home/api/getTransactionByPubkey")
                            i.el-icon-star-off 
                            span {{$t('api.transaction')}}
                        el-menu-item(index="/home/api/code")
                            i.el-icon-star-off 
                            span {{$t('api.codeInfo')}}
            el-col(:span="19")
                .api-page
                    router-view
</template>

<script>
export default {
    mounted() {
        
    },
    data() {
        return {
            
        }
    },
    methods:{

    }
}
</script>

<style lang='scss'>
    @import './api.scss';
</style>
