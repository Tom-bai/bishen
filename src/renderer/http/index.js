import axios from 'axios'
import qs from 'querystring'
import ElementUI from 'element-ui'
import en from '@/lang/en';
import zh from '@/lang/zh';

const ip = process.env.URL+':'+process.env.PORT+'/';//测试/生产地址
let ip1 = process.env.URL+':'+process.env.PORT+'/'//生产地址(平时测试不改，测试与生产里面都有接口调用)
let $t;

if(localStorage.getItem('lang')=='en') {
    $t=en;
}else {
    $t=zh;
}

const Axios = axios.create({
    baseURL: ip,
    timeout: 6000,
    responseType: 'json',
    headers: {
        'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'
    }
})

let Axios1 = axios.create({
    baseURL: ip1,//只能是生产ip
    timeout: 6000,
    responseType: 'json',
    headers: {
        'Content-Type':'application/x-www-form-urlencoded;charset=utf-8'
    }
})

/**
 * ===============请求未得到返回数据的接口时，断开之前数据的请求  START==================
 */
let pending = []; // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let CancelToken = axios.CancelToken;
let removePending = (config) => {
    for (let p in pending) {
        if (pending[p].u === config.url + '&' + config.method) { // 当当前请求在数组中存在时执行函数体
            pending[p].f(); // 执行取消操作
            pending.splice(p, 1); // 把这条记录从数组中移除
        }
    }
};
/**
 * ===============请求未得到返回数据的接口时，断开之前数据的请求  END==================
 */
let checkCode =(res)=> {
    // 返回res不提示的成功code
    let goResArr = [ 100,107,110,112,116,118,120,121,122,202 ];
    // 返回res和提示的成功code
    let tipSuccessAndGoResArr = [ 110,116,118,119,138,139,145,150,151,200 ];
    // 合并起来的集合
    let allArr = goResArr.concat( tipSuccessAndGoResArr );
    let contractCodeStart = 10000;//编译合约的code起点
    let smallCodeLength = 600;//普通code最高600
    if(localStorage.getItem('lang')=='en') {
        $t=en;
    }else {
        $t=zh;
    }
    if(res.data.code < contractCodeStart){
        for (let i = 1; i <= smallCodeLength; i++) {
            if( res.data.code==i ){
                if(!allArr.includes(i)){
                    ElementUI.Message({
                        message:$t.tip['code'+ i],
                        type: 'warning'
                    })
                    return Promise.resolve(res.data);
                    break;
                }else{
                    if( tipSuccessAndGoResArr.includes(i) ){
                        ElementUI.Message({
                            message:$t.tip['code'+ i],
                            type: 'success'
                        })
                    }
                    return Promise.resolve(res.data)
                    break;
                }
            }
        }
    } else {
        return Promise.resolve(res.data);
    }
}

Axios.interceptors.response.use(
    response => {
        removePending(response.config);//请求未得到返回数据的接口时，断开之前数据的请求
        return checkCode(response);
    },
    error => {
        // console.log(error)
        return Promise.reject(error.data)
    }
);

Axios.interceptors.request.use(
    config => {
        removePending(config); // 在一个ajax发送前执行一下取消操作
        config.cancelToken = new CancelToken((c) => {
            // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
            pending.push({ u: config.url + '&' + config.method, f: c });
        });
        if (
            config.method === "post" ||
            config.method === "put" ||
            config.method === "delete"
        ){
            config.data = qs.stringify(config.data)
        }
            return config
    },
    error => {
        console.log(error)
        return Promise.reject(error.data.error.message)
    }
)

Axios1.interceptors.response.use(
    response => {
        return checkCode(response);
    },
    error => {
        return Promise.reject(error.data)
    }
);

Axios1.interceptors.request.use(
    config => {
        removePending(config); // 在一个ajax发送前执行一下取消操作
        config.cancelToken = new CancelToken((c) => {
            // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
            pending.push({ u: config.url + '&' + config.method, f: c });
        });
        if (
            config.method === "post" ||
            config.method === "put" ||
            config.method === "delete"
        ){
            config.data = qs.stringify(config.data)
        }
            return config
    },
    error => {
        return Promise.reject(error.data.error.message)
    }
)

function get(url) {
    return body => Axios.get(url, { params: body })
}

function get1(url) {
    return body => Axios1.get(url, { params: body })
}

function post(url) {
    return body => Axios.post(url, body)
}
function post1(url) {
    return body => Axios1.post(url, body)
}
export const formatDate = (a)=> { //格式化时间
    let now = new Date(a);
    let year=now.getFullYear();
    let month=now.getMonth()+1;
    let date=now.getDate();
    let hour=now.getHours();
    let minute=now.getMinutes();
    let second=now.getSeconds();
    if(month<10) {
        month='0'+month
    }
    if(date<10) {
        date='0'+date
    }
    if(hour<10) {
        hour='0'+hour
    }
    if(minute<10) {
        minute='0'+minute
    }
    if(second<10) {
        second='0'+second
    }
    return year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second;
}

export const changLang = (lang)=>{
    localStorage.setItem('lang',lang);
    if(localStorage.getItem('lang')=='en') {
        $t=en;
    }else {
        $t=zh;
    }
}

export const numsAdd = (arg1, arg2)=> {
    var r1, r2, m, c;
    try {
        r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    c = Math.abs(r1 - r2);
    m = Math.pow(10, Math.max(r1, r2));
    if (c > 0) {
        var cm = Math.pow(10, c);
        if (r1 > r2) {
            arg1 = Number(arg1.toString().replace(".", ""));
            arg2 = Number(arg2.toString().replace(".", "")) * cm;
        } else {
            arg1 = Number(arg1.toString().replace(".", "")) * cm;
            arg2 = Number(arg2.toString().replace(".", ""));
        }
    } else {
        arg1 = Number(arg1.toString().replace(".", ""));
        arg2 = Number(arg2.toString().replace(".", ""));
    }
    return (arg1 + arg2) / m;
}

export const numsMul = (arg1, arg2)=> {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
        m += s1.split(".")[1].length;
    }
    catch (e) {
    }
    try {
        m += s2.split(".")[1].length;
    }
    catch (e) {
    }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
}


export const getTheTrend = post('/WalletController/getTheTrend'); //趋势图
export const getTotalBalance = get('/WalletController/getTotalBalance.do'); //获取总资产
export const getAllAccount = get('/WalletController/getAllAccount.do'); //获取所有钱包账户
export const getAccountInfo = get('/WalletController/getAccountInfo.do'); //获取账户详细信息
export const getBlockInfo = get('/WalletController/getBlockInfo.do'); //获取区块四大信息
export const getBlockListInfo = get('/WalletController/getBlockListInfo.do'); //获取区块列表
export const getBlockInfoByBlockHeightDealWithData = get('/WalletController/getBlockInfoByBlockHeightDealWithData.do'); //获取区块列表
export const getTransactionByPubkey = get('/WalletController/getTransactionByPubkey.do'); //获取流水
export const getTransactionByHash = post('/WalletController/getTransactionByHash.do'); //获取交易
export const getNodeState = get('/WalletController/getNodeState.do'); //获取节点状态
export const noteFoundryMachineState = get('/FoundryMachineController/noteFoundryMachineState.do'); //获取节点状态

export const getTransactionList = get1('/WalletController/getTransactionList.do'); //获取区块列表
export const getsyncBlockSchedule = get('/WalletController/getsyncBlockSchedule.do'); //获取区块同步
export const createAccount = post('/WalletController/createAccount.do'); //创建钱包
export const exportWallet = post('/WalletController/exportWallet.do'); //导出钱包
export const importWallet = post('/WalletController/importWallet.do'); //导出钱包
export const transferAccounts = post('/WalletController/transferAccounts.do'); //转币接口
export const validataAddressIsTrans = post('/WalletController/validataAddressIsTrans.do'); //是否需要公钥
export const startFoundryMachine = get('/FoundryMachineController/startFoundryMachine.do'); //开始锻造
export const stopFoundryMachine = get('/FoundryMachineController/stopFoundryMachine.do'); //停止锻造
export const FoundryMachineState = get('/FoundryMachineController/foundryMachineState.do'); //查看锻造状态

// 代币相关
export const getTokenList = get('/WalletController/getTokenList.do'); //已选代币列表
export const getTokenListByAddress = get('/WalletController/getTokenListByAddress.do'); //根据地址选择代币列表
export const tokenOpenAndCloseList = get('/WalletController/tokenOpenAndCloseList.do'); //待选代币列表
export const tokenOpenAndCloseListFuzzy = get('/WalletController/tokenOpenAndCloseListFuzzy.do'); //待选代币列表(查找)
export const addToken = post('/TokenController/addToken.do'); //发行代币
export const tokenOpenAndClose = get('/WalletController/tokenOpenAndClose.do'); //发行代币
export const getAddTokenFee = get('/TokenController/getAddTokenFee'); //代币手续费
export const createToken = post('/contract/createToken'); //确定发行代币


// 合约相关
export const myContract = post('/contract/myContract'); //我的合约列表(兑换/投票)
export const marketPlace = post('/contract/marketPlace'); //交易市场(兑换/投票)
export const createContract = post('/contract/createContract'); //检查合约
export const compileContract = post('/contract/compileContract'); //编译合约
export const cancelContract = post('/contract/cancelContract'); //撤销合约
export const conTransaction = post('/contract/transaction'); //兑换
export const conVotesList = post('/contract/votesList.do'); //查看参与投票的钱包
export const vote = post('/contract/vote.do'); //点击投票
export const getContractDetails = get('/contract/getContractDetails'); //合同详情
export const getOrtherContract = post('/contract/getOrtherContract.do'); //JDK合约列表获取
export const contractInvoke = post('/contract/invoke.do'); //执行该方法

