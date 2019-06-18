<template lang='pug'>
    .page
        h3.title {{$t('api.codeInfo')}}
        .group
            el-table(style="width: 100%" :data="code")
                el-table-column(prop="code" :label="$t('api.code')")
                el-table-column(prop="remark" :label="$t('api.remark')" )

</template>

<script>
import codeEN from './apis/code_EN.js'
import codeZH from './apis/code_ZH.js'
export default {
    mounted() {
        if(localStorage.getItem('lang')==='en') {
            this.code= codeEN
        }else {
            this.code= codeZH
        }
    },
    updated() {
        
    },
    data() {
        return {
            pageData: [],
            code:null
        }
    },
    methods:{
        fetchDate() {
            this.pageData= info[this.$route.params.page]
            
        }
    },
    watch: {
        "$route": "fetchDate"
    }
}
</script>

<style lang='scss'>
    @import './page.scss';
</style>
