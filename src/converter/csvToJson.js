
/**
  csvToJson -- converter will convert the CSV data into JSON data that can be used in -
  option.dataSet.series = [...]

  Compatible with : AreaChart , LineChart

  How to use:
  Run in CLI : c:\path\to\this\folder> node csvToJson

  output: Will create the JSON file named output.json
 */

/* eslint-disable no-console */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;

const usageMsg = 'usage: node csvTojson --input=\'inputFileName.csv\' [--output=\'output.json\']';

if(!argv.input) {
  console.error('error: --input param not set.');
  console.info(usageMsg);
  process.exit(1);
}

const inputFile = path.join(__dirname, argv.input);
const outputFile = path.join(__dirname, argv.output || './output.json');

try {
  const extName = path.extname(inputFile);
  if(!fs.existsSync(inputFile) || extName !== '.csv') {
    throw new Error('Invalid CSV File !');
  }
}catch(err) {
  console.log(err.message);
  console.error(`error: --input File "${inputFile}" is not a valid CSV file or would't exists.\n${err.message} \nPlease provide a valid CSV File...`);
  console.info(usageMsg);
  process.exit(1);
}

const readStream = fs.createReadStream(inputFile);
const writeStream = fs.createWriteStream(outputFile);

const converter = readline.createInterface({
  input: readStream,
  terminal: false
});

let outputData = [];
let dummyData = {
  'lineWidth': 1.5,
  'name': '',
  'areaOpacity': 0.3,
  'spline': true,
  'animated': true,
  'data': []
};

let lineno = 0;
converter.on('line', (line) => {
  const row = line.split(',');
  if (lineno === 0) {
    for (let i = 1; i < row.length; i++) {
      let seriesData = JSON.parse(JSON.stringify(dummyData));
      seriesData.name = row[i].replace(/\"/g, '');
      outputData.push(seriesData);
    }
  } else {
    for (let i = 0; i < outputData.length; i++) {
      outputData[i].data.push({
        label: row[0],
        value: +row[i + 1]
      });
    }
  }
  lineno++;
});

converter.on('close', () => {
  writeStream.write(JSON.stringify(outputData));
  writeStream.end();
  console.info(`Conversion is successfully done. \nOutput saved in file "${outputFile}"`);
  process.exit(0);
});

converter.on('error', (err) => {
  console.log(err);
  process.exis(1);
});