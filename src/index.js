/*
 * @moduleName: 模块名称
 * @Author: suLiang
 * @Date: 2021-12-13 00:07:30
 * @LastModifiedBy: suLiang
 * @LastEditTime: 2022-10-08 00:16:47
 */
const express = require('express')

// const spider = require('./spider');
const spiderAsync = require('./spider-async');

// spider();
spiderAsync();

const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World1!'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))