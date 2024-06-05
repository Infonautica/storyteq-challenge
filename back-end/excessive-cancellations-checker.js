import { readAndGroupByCompanies } from "./parser.js";

const ORDER_TYPE = {
  NEW_ORDER: "D",
  CANCEL: "F",
};

export class ExcessiveCancellationsChecker {
  constructor(filePath) {
    this.filePath = filePath;
  }

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

  check(orders) {
    const ordersCount = orders.length;
    let totalQuantity = 0;
    let cancelQuantity = 0;

    orders.forEach((order) => {
      const orderQuanity = parseInt(order.quantity, 10);
      const isCancel = order.orderType === ORDER_TYPE.CANCEL;

      totalQuantity += orderQuanity;
      cancelQuantity += isCancel ? orderQuanity : 0;
    });

    return this.isExcessiveCancellation(
      ordersCount,
      totalQuantity,
      cancelQuantity,
    );
  }

  isCompanyInvolvedInExcessiveCancellations(companyOrders) {
    const companyOrdersCount = companyOrders.length;
    for (let i = 0; i < companyOrdersCount; i += 1) {
      const rangeOrders = getOrdersInRange(companyOrders, i);
      const { prevOrders, cursorOrder, nextOrders } = rangeOrders;
      const thresholdOrders = [...prevOrders, cursorOrder, ...nextOrders];

      const isPrevExcessive = this.check([...prevOrders, cursorOrder]);
      if (isPrevExcessive) {
        return true;
      }
    }

    return false;
  }

  isExcessiveCancellation(ordersCount, totalQuantity, cancelQuantity) {
    if (ordersCount === 1) {
      return false;
    }

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
    if (orderTime >= startTime) {
      prevOrders.unshift(prevOrder);
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
    if (orderTime <= endTime) {
      nextOrders.push(nextOrder);
    } else {
      break;
    }

    nextOrderIndex += 1;
  }

  return { prevOrders, cursorOrder, nextOrders };
}
