//Setup
import {
  ExcessiveCancellationsChecker,
  parseCSVLine,
  getOrdersInRange,
} from "../excessive-cancellations-checker.js";

const checker = new ExcessiveCancellationsChecker("./data/trades.csv");

describe("My Tests", () => {
  describe("isCompanyInvolvedInExcessiveCancellations", () => {
    it("approves when next orders within 1min are exccesive cancelations", async () => {
      const rows = [
        "2015-05-21 16:58:23,Ape accountants,F,10000",
        "2015-05-21 16:58:29,Ape accountants,F,10000",
      ];

      const parsedRows = rows.map((line) => parseCSVLine(line));
      const companyOrders = parsedRows.filter((row) => row !== null);

      const res = checker.isCompanyInvolvedInExcessiveCancellations(
        "Ape accountants",
        companyOrders,
      );

      expect(res).toBe(true);
    });

    it("rejects when next orders within 1min are NOT exccesive cancelations", async () => {
      const rows = [
        "2015-05-21 16:58:23,Ape accountants,F,10000",
        "2015-05-21 16:58:29,Ape accountants,D,10000",
      ];

      const parsedRows = rows.map((line) => parseCSVLine(line));
      const companyOrders = parsedRows.filter((row) => row !== null);

      const res = checker.isCompanyInvolvedInExcessiveCancellations(
        "Ape accountants",
        companyOrders,
      );

      expect(res).toBe(true);
    });

    it("rejects when preceeding items are new orders", async () => {
      const rows = [
        "2015-05-21 17:41:20,Bank of History,D,100",
        "2015-05-21 17:41:20,Bank of History,D,100",
        "2015-05-21 17:41:20,Bank of History,D,100",
        "2015-05-21 17:41:20,Bank of History,F,1",
        "2015-05-21 17:41:20,Bank of History,F,1",
        "2015-05-21 17:41:20,Bank of History,F,1",
        "2015-05-21 17:41:20,Bank of History,F,1",
        "2015-05-21 17:41:20,Bank of History,F,1",
        "2015-05-21 17:41:20,Bank of History,F,1",
        "2015-05-21 17:41:20,Bank of History,F,1",
        "2015-05-21 17:41:20,Bank of History,F,1",
      ];

      const parsedRows = rows.map((line) => parseCSVLine(line));
      const companyOrders = parsedRows.filter((row) => row !== null);

      const res = checker.isCompanyInvolvedInExcessiveCancellations(
        "Bank of History",
        companyOrders,
      );

      expect(res).toBe(false);
    });
  });
});
