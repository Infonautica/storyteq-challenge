import fs from "fs";
import path from "path";

// TODO: convert to static properties
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
    const csv = await parseFile(this.filePath);
    const records = parseCSV(csv);

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

  isCompanyInvolvedInExcessiveCancellations(company, companyOrders) {
    const companyOrdersCount = companyOrders.length;
    for (let i = 0; i < companyOrdersCount; i += 1) {
      const rangeOrders = getOrdersInRange(companyOrders, i);
      const { cursorOrder, prevOrders, nextOrders } = rangeOrders;

      const thresholdOrders = [...prevOrders, cursorOrder, ...nextOrders];

      if (thresholdOrders.length === 1) {
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

      if (this.isExcessiveCancellation(totalQuantity, cancelQuantity)) {
        const cancelRatio = cancelQuantity / totalQuantity;
        const info = {
          index: i,
          company,
          totalQuantity,
          cancelQuantity,
          cancelRatio,
          thresholdOrders,
          totalCompanyOrders: companyOrdersCount,
        };
        console.log(JSON.stringify(info, null, 2));
        return true;
      }
    }

    return false;
  }

  isExcessiveCancellation(totalQuantity, cancelQuantity) {
    const cancelRatio = cancelQuantity / totalQuantity;
    return cancelRatio > EXCESSIVE_CANCELLATION_RATIO;
  }

  /**
   * Returns the total number of companies that are not involved in any excessive cancelling.
   * Note this should always resolve a number or throw error.
   */
  async totalNumberOfWellBehavedCompanies() {
    //TODO Implement...
  }
}

async function parseFile(filePath) {
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

export function getOrdersInRange(orders, cursorIndex) {
  const cursorOrder = orders[cursorIndex];
  const orderTime = new Date(cursorOrder.time);
  const startTime = new Date(
    orderTime.valueOf() - EXCESSIVE_CANCELLATION_THRESHOLD_MS,
  );
  const endTime = new Date(
    orderTime.valueOf() + EXCESSIVE_CANCELLATION_THRESHOLD_MS,
  );

  // Get previous orders
  const prevOrders = [];
  let prevOrderIndex = cursorIndex - 1;

  while (true) {
    const prevOrder = orders[prevOrderIndex];
    if (!prevOrder) {
      break;
    }

    const orderTime = new Date(prevOrder.time);
    if (orderTime >= startTime && orderTime <= endTime) {
      prevOrders.push(prevOrder);
    } else {
      break;
    }

    prevOrderIndex -= 1;
  }

  // Get next orders
  const nextOrders = [];
  let nextOrderIndex = cursorIndex + 1;

  while (true) {
    const nextOrder = orders[nextOrderIndex];
    if (!nextOrder) {
      break;
    }

    const orderTime = new Date(nextOrder.time);
    if (orderTime >= startTime && orderTime <= endTime) {
      nextOrders.push(nextOrder);
    } else {
      break;
    }

    nextOrderIndex += 1;
  }

  return { cursorOrder, prevOrders, nextOrders };
}
