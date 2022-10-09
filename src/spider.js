const superagent = require('superagent')
const cheerio = require('cheerio')
const fse = require('fs-extra')

let homgPage = '';
let list = [];
let content = '';

const config = require('../config');
let base = config.base;
let baseUrl = config.baseUrl;

let title = '';
let author = '';
let last_date = '';

let getList = (res) => {
    const $ = cheerio.load(res.text);
    // console.log(, '11');
    // const html = $.html();
    // title = $(html).
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
    return list;
};

let getContext = (res) => {
    const $ = cheerio.load(res.text);
    $("#content p").remove();
    content += $("#content").text();
    // console.log(content);
};
let count = 0;
const spider = async () => {
    count ++;
    /**
     * index.js
     * [description] - 使用superagent.get()方法来访问百度新闻首页
     */
    // superagent.get(base + baseUrl).end((err, res) => {
    //     if (err) {
    //         // 如果访问失败或者出错，会这行这里
    //         console.log(`热点新闻抓取失败 - ${err}`)
    //     } else {
    //         // 访问成功
    //         homgPage = getList(res);
    //     }
    // });
    if (count > 5) {
        console.error('执行失败');
    }
    let root_url = base + baseUrl;
    let returnFlag = await getHtmlPage(root_url, getList);
    if (returnFlag) {
        content += title;
        // const len = list.length;
        const len = 1;
        // list.map()
        for (let index = 0; index < len; index++) {
            const ele = list[index];
            content += '\n\n       ' + ele.name + '\n\n';
            console.log('per:', ((index/len) * 100 ).toFixed(2)) + '%';
            // if (index < 2) {
                let flag = await getInnerContext(base + ele.url);
                if (!flag) {
                    content += '内容获取失败';
                    console.log('获取失败：', ele.name);
                }
                
            // }
        }

        wf(content);
        // 清空缓存
        content = '';
    } else {
        // 如果失败就重新执行
        spider();
    }
};

const getInnerContext = async(url) => {
    let count = 0;
    if (count > 5) {
        return false;
    }
    let flag = await getHtmlPage(url, getContext);
    if (!flag) {
        count ++;
        getInnerContext(url);
    }
    return true;
}

const wf = (cxt) => {
    const filePath = './file/' + title + '.txt';
    fse.outputFile(filePath, cxt).then(res => {
        console.log('res ===> 操作成功', filePath, cxt);
    }).catch((res) => {
        console.log('res ===> 操作失败');
    })
};

const getHtmlPage = (url, cb) => {
    return new Promise((resolve, reject) => {
        superagent.get(url).end((err, res) => {
            if (err) {
                // 如果访问失败或者出错，会这行这里
                console.log(`热点新闻抓取失败 - ${err}`);
                // reject(Error('热点新闻抓取失败'));
                resolve(false);
            } else {
                // 访问成功
                // homgPage = getList(res);
                typeof cb === 'function' && cb(res);
                resolve(true);
            }
        });
    });
}


module.exports = spider;