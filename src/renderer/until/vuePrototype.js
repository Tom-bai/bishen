const pkg = require('./../../../package.json')
const http = require('http');
const shell = require('electron').shell

export default {
    install: (Vue, options) => {
        // 接口中英切换取值取值
        Vue.prototype._VER = pkg.version;

        Vue.prototype.GET_BY_NODE = (url) => {
            return new Promise((resolve, reject) => {
                http.get(url, res => {
                    const { statusCode } = res;
                    if (statusCode != 200) {
                        reject('erro')
                    } else {
                        res.on('data', (chunk) => {
                            resolve(chunk.toString());
                        });
                    }
                })
            })
        };

        Vue.prototype.IS_VER_MATCH = async ()=>{
            try {
                let vs = await Vue.prototype.GET_BY_NODE('http://photonchain.vip/version.txt');
                if(vs.replace(/\s+/g,"") !== Vue.prototype._VER) {
                    alert('出现新版本，请到官网进行下载');
                    setTimeout(() => {
                        shell.openExternal('http://photonchain.vip')
                    },2000)
                    return false;
                }else {
                    return true
                }
            } catch(e) {
                alert('连接版本号服务器失败，请重试或联系管理员')
                return false;
            }
        }
    }
}