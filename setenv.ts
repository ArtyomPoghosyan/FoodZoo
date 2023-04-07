const { writeFile } = require('fs');
const { argv } = require('yargs');// читаем аргументы командной строки
require('dotenv').config();// читаем константы из .env файла
// const environment = argv.environment;

const paths = [
    './src/environments/environment.prom.ts',
    './src/environments/environment.dev.ts',
    './src/environments/environment.release.ts',
    './src/environments/environment.staging.ts',
    './src/environments/environment.test.ts',
    './src/environments/environment.ts',
];

const environmentFileContent = () => {
    return `export const environment = {
    production: ${process.env.PRODUCTION},
    api_url: "${process.env.API_URL}",
    OKRU_CLIENT_ID: "${process.env.OKRU_CLIENT_ID}",
    SITEKEY:"${process.env.SITEKEY}" 
}`;
}
    // write the content to the respective file
for (const pathsKey in paths) {
    writeFile(paths[pathsKey], environmentFileContent(), (err) => {
        if (err) {
            console.log(err);
        }
        console.log(`Wrote variables to ${paths[pathsKey]}`);
    });
}



