import fs from "fs";
import path from "path";

const ORDER_TYPE = {
  NEW_ORDER: "D",
  CANCEL: "F",
};

const EXCESSIVE_CANCELLATION_THRESHOLD_MS = 60_000;
const EXCESSIVE_CANCELLATION_RATIO = 0.33;

export class ExcessiveCancellationsChecker {
  constructor(filePath) {
    this.filePath = filePath;
  }

  /**
   * Returns the list of companies that are involved in excessive cancelling.
   * Note this should always resolve an array or throw error.
   */
  async companiesInvolvedInExcessiveCancellations() {
    const records = await this.parseFile();
    const uniqueCompanies = [
      ...new Set(records.map((record) => record.company)),
    ];
    const companiesInvolved = uniqueCompanies.filter((company) => {
      const companyOrders = records.filter(
        (record) => record.company === company,
      );

      return this.isCompanyInvolvedInExcessiveCancellations(
        company,
        companyOrders,
      );
    });

    return companiesInvolved;
  }

  async isCompanyInvolvedInExcessiveCancellations(company, companyOrders) {
    for (const cursorOrder of companyOrders) {
      // Define timestamps for the threshold
      const cursorOrderTime = new Date(cursorOrder.time);
      const cursorOrderEndTime = new Date(
        cursorOrderTime + EXCESSIVE_CANCELLATION_THRESHOLD_MS,
      );

      // Find all of the oders from the threshold
      const thresholdOrders = companyOrders.filter((order) => {
        const orderTime = new Date(order.time);
        return orderTime >= cursorOrderTime && orderTime <= cursorOrderEndTime;
      });

      if (thresholdOrders.length <= 1) {
        continue;
      }

      const cancelOrders = thresholdOrders.filter(
        (order) => order.orderType === ORDER_TYPE.CANCEL,
      );

      const totalQuantity = thresholdOrders.reduce(
        (acc, order) => acc + parseInt(order.quantity, 10),
        0,
      );
      const cancelQuantity = cancelOrders.reduce(
        (acc, order) => acc + parseInt(order.quantity, 10),
        0,
      );

      const cancelRatio = cancelQuantity / totalQuantity;
      if (cancelRatio > EXCESSIVE_CANCELLATION_RATIO) {
        console.log(
          `${company} has ${totalQuantity} orders of which ${cancelQuantity} are cancels, ratio: ${cancelRatio} via ${thresholdOrders.length} records`,
        );
        return true;
      }
    }

    return false;
  }

  /**
   * Returns the total number of companies that are not involved in any excessive cancelling.
   * Note this should always resolve a number or throw error.
   */
  async totalNumberOfWellBehavedCompanies() {
    //TODO Implement...
  }

  async parseFile() {
    return new Promise((resolve, reject) => {
      const resovledPath = path.resolve(__dirname, this.filePath);
      fs.readFile(resovledPath, "utf8", (err, data) => {
        if (err) {
          return reject(err);
        }

        const rawLines = data.split("\n");
        const parsedRows = rawLines.map((line) => this.parseFileLine(line));
        const validRows = parsedRows.filter((row) => row !== null);
        resolve(validRows);
      });
    });
  }

  parseFileLine(line) {
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
}
