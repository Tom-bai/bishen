const http = require('http');

function GET_BY_NODE(url) {
  return new Promise((resolve,reject) => {
    http.get(url , res => {
      const { statusCode } = res;
      if( statusCode != 200 ) {
        reject('erro')
      }else {
        res.on('data', (chunk) => { 
          resolve(chunk.toString());
        });
      }
    })
  })
}

async function test() {
  const res = await GET_BY_NODE('http://photonchain.vip/version.txt');
  console.log(res);
}

