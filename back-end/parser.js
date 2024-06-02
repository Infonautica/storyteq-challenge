import fs from "fs";
import path from "path";

export function parseFile(filePath) {
  return new Promise((resolve, reject) => {
    const resovledPath = path.resolve(__dirname, filePath);
    fs.readFile(resovledPath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });
}

export function parseCSVLine(line) {
  const elements = line.split(",").map((item) => item.trim());
  const [time, company, orderType, quantity] = elements;

  if (!time || !company || !orderType || !quantity) {
    console.log("Invalid line, skipping parsing:", line);
    return null;
  }

  return {
    time,
    company,
    orderType,
    quantity,
  };
}

export function parseCSV(data) {
  const rawLines = data.split("\n");
  const parsedRows = rawLines.map((line) => parseCSVLine(line));
  const validRows = parsedRows.filter((row) => row !== null);
  return validRows;
}

export async function readAndGroupByCompanies(filePath) {
  const csv = await parseFile(filePath);
  const records = parseCSV(csv);

  return records.reduce((acc, record) => {
    const { company } = record;

    if (!acc[company]) {
      acc[company] = [];
    }

    acc[company].push(record);
    return acc;
  }, {});
}
