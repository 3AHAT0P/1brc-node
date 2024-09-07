import fs from 'node:fs';

type MeasurementInfo = [sum: number, count: number, min: number, max: number];

const input_file_path = './data/weather_stations.csv';
const output_file_path = './output.csv';

const main = async () => {
  const result = new Map<string, MeasurementInfo>();
  let name = '';
  let value = '';
  let isNameParsing = true;
  const readStream = fs.createReadStream(input_file_path, { encoding: 'utf8', highWaterMark: 512 * 1024 });
  readStream.on('data', (chunk) => {
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] === '\n') {
        const value_number = Number(value);

        if (result.has(name)) {
          const measurenment =result.get(name)!;
          result.set(name, [
            measurenment[0] + value_number,
            measurenment[1] + 1,
            measurenment[2] < value_number ? measurenment[2] : value_number,
            measurenment[3] > value_number ? measurenment[3] : value_number,
          ]);
        } else {
          result.set(name, [value_number, 1, value_number, value_number]);
        }
        isNameParsing = true;
        name = '';
        value = '';
      } else if (chunk[i] === ';') {
        isNameParsing = false;
      } else {
        if (isNameParsing) {
          name += chunk[i];
        } else {
          value += chunk[i];
        }
      }
    }
  });

  readStream.on('end', async () => {
    const resultArray = [];
    for (const [key, value] of result) {
      // Abha=-23.0/18.0/59.2
      resultArray.push([key, `${value[2]}/${Math.round(value[0] / value[1])}/${value[3]}`]);
    }
    resultArray.sort((a, b) => a[0] > b[0] ? 1 : -1);
    let data = '';
    for (const [key, value] of resultArray) {
      data += `${key}=${value},\n`;
    }
    await fs.promises.writeFile(output_file_path, data, { encoding: 'utf8' });
  });
};

main();