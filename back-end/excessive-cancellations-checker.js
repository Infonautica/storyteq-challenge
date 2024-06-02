import { readAndGroupByCompanies } from "./parser.js";

export class ExcessiveCancellationsChecker {
  constructor(filePath) {
    this.filePath = filePath;
  }

  static ORDER_TYPE = {
    NEW_ORDER: "D",
    CANCEL: "F",
  };

  static THRESHOLD_MS = 60_000;
  static MAX_RATIO = 0.33;

  /**
   * Returns the list of companies that are involved in excessive cancelling.
   * Note this should always resolve an array or throw error.
   */
  async companiesInvolvedInExcessiveCancellations() {
    const data = await readAndGroupByCompanies(this.filePath);

    const uniqueCompanies = Object.keys(data);
    const companiesInvolved = uniqueCompanies.filter((company) => {
      const companyOrders = data[company];
      return this.isCompanyInvolvedInExcessiveCancellations(companyOrders);
    });

    return companiesInvolved;
  }

  /**
   * Returns the total number of companies that are not involved in any excessive cancelling.
   * Note this should always resolve a number or throw error.
   */
  async totalNumberOfWellBehavedCompanies() {
    const data = await readAndGroupByCompanies(this.filePath);

    const uniqueCompanies = Object.keys(data);
    const wellBehavedCompanies = uniqueCompanies.filter((company) => {
      const companyOrders = data[company];
      return !this.isCompanyInvolvedInExcessiveCancellations(companyOrders);
    });

    return wellBehavedCompanies.length;
  }

  isCompanyInvolvedInExcessiveCancellations(companyOrders) {
    const companyOrdersCount = companyOrders.length;
    for (let i = 0; i < companyOrdersCount; i += 1) {
      const rangeOrders = getOrdersInRange(companyOrders, i);
      const { cursorOrder, prevOrders, nextOrders } = rangeOrders;

      const thresholdOrders = [...prevOrders, cursorOrder, ...nextOrders];
      if (thresholdOrders.length === 1) {
        continue;
      }

      const { CANCEL } = ExcessiveCancellationsChecker.ORDER_TYPE;
      const cancelOrders = thresholdOrders.filter(
        (order) => order.orderType === CANCEL,
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
        return true;
      }
    }

    return false;
  }

  isExcessiveCancellation(totalQuantity, cancelQuantity) {
    const maxRatio = ExcessiveCancellationsChecker.MAX_RATIO;

    const cancelRatio = cancelQuantity / totalQuantity;
    return cancelRatio > maxRatio;
  }
}

export function getOrdersInRange(orders, cursorIndex) {
  const cursorOrder = orders[cursorIndex];

  const thresholdMs = ExcessiveCancellationsChecker.THRESHOLD_MS;

  const orderTime = new Date(cursorOrder.time);
  const startTime = new Date(orderTime.valueOf() - thresholdMs);
  const endTime = new Date(orderTime.valueOf() + thresholdMs);

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
