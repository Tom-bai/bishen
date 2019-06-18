// let ip = 'http://'+process.env.BASE_URL+':'+process.env.PORT_PRO+'/';
let ip = process.env.URL+':'+process.env.PORT+'/';

export default {
    create: {
        name: 'createAccount',
        api: ip + 'WalletController/createAccount.do',
        method: 'POST',
        params: [
            {
                name: 'passWord',
                required: 'Yes',
                type: 'string',
                enRemark: 'passWord',
                zhRemark: '钱包密码'
            }
        ],
        curl: 'curl -d "passWord=123456" '+ ip +'/WalletController/createAccount.do',
        back: `
{
    "code": 100,
    "data": {
        "address": "pxad57159bcefb979f3f2cc86c78e0b6d0669a919a",
        "priKey": "a071ea869537e83de658520d781037b735098567312c9c55446e36cca90e3aad",
        "pubKey": "046884215561f8e8b0023e494b37fa47aa6838ce758518a0e94028d0ec90dfd1c70ff27b11928399fe2f217f4aa25a35d5501dff1648151585c114f115008ffcdc"
    }
}`
    },
    getAccountInfo: {
        name: 'getAccountInfo',
        api: ip +'WalletController/getAccountInfo.do',
        method: 'GET',
        params: [
            {
                name: 'address',
                required: 'Yes',
                type: 'string',
                enRemark: 'Wallet address',
                zhRemark: '钱包地址',
            }, {
                name: 'tokenName',
                required: 'Yes',
                type: 'string',
                enRemark: 'Token name',
                zhRemark: 'Token名',
            }, {
                name: 'pageNumber',
                required: 'Yes',
                type: 'int',
                enRemark: 'Page number',
                zhRemark: '页码',
            }, {
                name: 'pageSize',
                required: 'Yes',
                type: 'int',
                enRemark: 'Page size',
                zhRemark: '每页记录',
            }
        ],
        curl: 'curl "'+ ip +'WalletController/getAccountInfo.do?address=pxa2a680a6aed4a84313005009fca42d3f235cc11e&tokenName=ptn&pageNumber=1&pageSize=10"',
        back: `
{
    "code": 100,
    "data": {
        "accountMap": {
            "totalEffectiveIncome": 53874.823112,
            "totalExpenditure": 0,
            "totalIncome": 53874.823112,
            "address": "pxda9b09a8cc85111ee9221029a3ac3b912d97f870",
            "balance": 53874.823112,
            "pubKey": "044d3ab3eb51effad52e2b8c302ac76c011493ee1a3600f07ddfa32117224fce0eb1ae8fee69d71815508a75c164f7c7d31b01304ec3e8d45a08d7331e494b7719"
        },
        "pageNumber": 1,
        "transactionList": [],
        "count": 1
    }
}`
    },
    transferAccounts: {
        name: 'transferAccounts',
        api: ip +'WalletController/transferAccounts.do',
        method: 'POST',
        params: [
            {
                name: 'transFrom',
                required: 'Yes',
                type: 'string',
                enRemark: 'Send account',
                zhRemark: '发送方',
            },
            {
                name: 'transTo',
                required: 'Yes',
                type: 'string',
                enRemark: 'Rec account',
                zhRemark: '接收方',
            },
            {
                name: 'transValue',
                required: 'Yes',
                type: 'long',
                enRemark: 'Amount',
                zhRemark: '金额',
            },
            {
                name: 'fee',
                required: 'Yes',
                type: 'long',
                enRemark: 'Fee',
                zhRemark: '矿工费',
            },
            {
                name: 'passWord',
                required: 'Yes',
                type: 'string',
                enRemark: 'Password',
                zhRemark: '密码',
            },
            {
                name: 'remark',
                required: 'Yes',
                type: 'string',
                enRemark: 'Remark',
                zhRemark: '备注',
            },
            {
                name: 'transToPubkey',
                required: 'No',
                type: 'string',
                enRemark: 'Rec\'s publickey',
                zhRemark: '接收方公钥',
            },
            {
                name: 'tokenName',
                required: 'Yes',
                type: 'string',
                enRemark: 'Token name',
                zhRemark: 'Token名',
            }
        ],
        curl: 'curl -d "transFrom=pxa2a680a6aed4a84313005009fca42d3f235cc11e&transTo=px0e4543cc71dd4b90002aec6b06f810b41878e2bb&transValue=1&fee=0.001&passWord=845820&transToPubkey=04d2ad6f8f6ccccbd7d42f366b9fb0a64a3899cb4fc1cecd94f26783ac04e9278857808ca2040546be74975b7cf9211fd0120d79e608c983faa8f9d0d1b23fd221&remark=xxx&tokenName=ptn" '+ ip +'WalletController/transferAccounts.do',
        back: `
{
    "code": 200,
    "data": {
        "transHash": "7b2272223a32303831363230353136313832383938393330353834303431313131323835353930363430373933313635363834313932323936383038333032393235333137303432363630393730353636362c2273223a32303137383033363231393332323930373738353036333834313839393731313734393631373134383537303131313437313031303435353436343838383031333837393438343033313632392c2276223a32377d"
    }
}`
    },
    getTransactionByPubkey: {
        name: 'getTransactionByPubkey',
        api: ip +'WalletController/getTransactionByPubkey.do',
        method: 'Get',
        params: [
            {
                name: 'pubKey',
                required: 'Yes',
                type: 'string',
                enRemark: 'Public key',
                zhRemark: '公钥',
            },
            {
                name: 'tokenName',
                required: 'Yes',
                type: 'string',
                enRemark: 'Token name',
                zhRemark: 'Token名',
            },
            {
                name: 'pageNumber',
                required: 'No',
                type: 'string',
                enRemark: 'Page number',
                zhRemark: '页码',
            },
            {
                name: 'pageSize',
                required: 'No',
                type: 'string',
                enRemark: 'Page size',
                zhRemark: '每页记录',
            },
            {
                name: 'ieType',
                required: 'Yes',
                type: 'string',
                enRemark: '0 means expenditure, 1 means income.',
                zhRemark: '为0时表示支出，为1时表示收入',
            }
        ],
        curl: 'curl "'+ ip +'WalletController/getTransactionByPubkey.do?pubKey=04d2ad6f8f6ccccbd7d42f366b9fb0a64a3899cb4fc1cecd94f26783ac04e9278857808ca2040546be74975b7cf9211fd0120d79e608c983faa8f9d0d1b23fd221&tokenName=ptn&pageNumber=1&pageSize=10"',
        back: `
{
    "code": 100,
    "data": {
        "pageNumber": 1,
        "transactionList": [
            {
                "date": "2018-03-22 18:13:09",
                "coinType": "ptn",
                "confirm": 1,
                "amount": 138,
                "blockHeight": 68633,
                "fee": 0,
                "from": "px7793735788656add96e3d949cb9c5cf1f4f57e64",
                "to": "px95d606222a88b0c99a224d170b7f97c9c3627897",
                "type": 3,
                "hash": "7b2272223a32333436333432383730353138353430363735333939333839343232353930353032373538313031303931303332383137343234373437323131333931373137323830313631343432353433392c2273223a34393931393434313032303532323033363232343232383830373939323938343333313831303933333335313934333537323137353736343338323937343531393235333133393137343238332c2276223a32387d"
            } 
        ],
        "count": 68662
    }
}`
    },
}