const fs = require("fs").promises;
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

app.use(express.static('dist/nodejs-files'))

run()

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

async function run() {
    app.get('/:userId', search)

    app.use('/', (req, res, next) => {
        res.render('result.pug');
    });
}

async function search(req, res) {

    var search = req.params.userId
    try {
        let result = await findFiles(search);
        if (result) {
            res.status(200).render('result.pug', {list: result});
        }
    } catch (e) {
        res.status(404).render('error.pug', {status: e});
    }
}


async function findFiles(folderName) {
    let salesFiles = [];

    const items = await fs.readdir(folderName, {withFileTypes: true});

    for (const item of items) {
        if (item.isDirectory()) {
            salesFiles = salesFiles.concat(
                await findFiles(`${folderName}/${item.name}`)
            );
        } else {
            const filename = item.name;
            const fileSizeInBytes = (await fs.stat(`${folderName}/${item.name}`)).size + ' bites';
            const extension = path.extname(item.name)
            const createdDate = (await fs.stat(`${folderName}/${item.name}`)).birthtime
            salesFiles.push({
                fullpath: `${__dirname}/${folderName}/${item.name}`,
                filename,
                fileSizeInBytes,
                extension,
                createdDate
            });
        }
    }
    return salesFiles

}
