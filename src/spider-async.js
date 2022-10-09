const superagent = require('superagent')
const cheerio = require('cheerio')
const fse = require('fs-extra')

const config = require('../config');

// let homgPage = '';
let list = [];
let base = config.base;
let baseUrl = config.baseUrl;

let title = '';
let author = '';
let last_date = '';

let indexProxy = new Map();

let getList = (res) => {
    const $ = cheerio.load(res.text);
    title = $('#info h1').text();
    author = $('#info').find('p:eq(0)').text();
    last_date = $('#info').find('p:eq(2)').text();
    console.log(title);
    console.log(author);
    console.log(last_date);

    let _list = Array.prototype.slice.call($('#list a'));
    list = _list.map((article,index) => {
        return {
            name: $(article).text(),
            url: $(article).attr('href')
        };
    });
    // list.forEach((ele, index) => {
    //     // if (index < 10) {
    //         console.log(ele)
    //     // }
    // });
    // return list;
};


let count = 0;
const spider = async () => {
    count ++;
    if (count > 5) {
        console.error('执行失败');
    }
    let root_url = base + baseUrl;
    let returnFlag = await getHtmlPage(root_url, getList);
    const pageListCount = list.length;
    // const pageListCount = 200;
    const loop = () => {
        if (indexProxy.size === pageListCount) {
            wf();
            return;
        }
        setTimeout(() => {
            console.log('per:', (((indexProxy.size/pageListCount) * 100 ).toFixed(2)) + '%');
            loop();
        }, 5 * 1000);
    };
    if (returnFlag) {
        
        for (let index = 0; index < pageListCount; index++) {
            const ele = list[index];
            getInnerContext(base + ele.url, index);
        }
        loop();
    } else {
        // 如果失败就重新执行
        spider();
    }

};


let getContext = (res, index) => {
    const $ = cheerio.load(res.text);
    $("#content p").remove();
    let pageTitle = $('h1').text();
    let content = '\n\n       ' + pageTitle + '\n\n';
    content += $("#content").text();
    indexProxy.set(index, content);
    content = '';
    // console.log(content);
};
const getInnerContext = async(url, index) => {
    let count = 0;
    if (count > 5) {
        return false;
    }
    let flag = await getHtmlPage(url, getContext, index);
    if (!flag) {
        count ++;
        getInnerContext(url, index);
    }
    return true;
}

const wf = () => {
    let cxt = getCxtFun();
    const filePath = './file/' + title + '.txt';
    fse.outputFile(filePath, cxt).then(res => {
        console.log('res ===> 操作成功');
    }).catch((res) => {
        console.log('res ===> 操作失败');
    })
};

const getCxtFun = () => {
    let content = title;
    
    for (let index = 0; index < indexProxy.size; index++) {
        content += indexProxy.get(index);
    }
    indexProxy = null;
    // console.log('content:', content);
    return content;
}

const getHtmlPage = (url, cb, index) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            superagent.get(url).end((err, res) => {
                if (err) {
                    // 如果访问失败或者出错，会这行这里
                    console.log(`热点新闻抓取失败 - ${err}`);
                    // reject(Error('热点新闻抓取失败'));
                    resolve(false);
                } else {
                    // 访问成功
                    // homgPage = getList(res);
                    typeof cb === 'function' && cb(res, index);
                    resolve(true);
                }
            });
        }, 50);
    });
}


module.exports = spider;