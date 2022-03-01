#!/usr/bin/env node
import http from "node:http";

function tickerToId(ticker) {
  return new Promise((resolve, reject) => {
    const body = `stock_symbol=${ticker}`;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": body.length,
      },
    };

    const req = http.request(
      "http://www.nepalstock.com/company",
      options,
      (res) => {
        if (
          res.headers.location?.startsWith(
            "http://www.nepalstock.com/company/display/"
          )
        ) {
          resolve(res.headers.location.split("/").slice(-1)[0]);
        } else {
          reject(new Error("Invalid ticker symbol."));
        }
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function getPrice({ date, tickerId }) {
  return new Promise((resolve, reject) => {
    const url = `http://www.nepalstock.com/company/graphdata/${tickerId}/Y`;
    const req = http.request(url, (res) => {
      let data = "";
      res.setEncoding("utf-8");
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          let prices = JSON.parse(data);
          prices = prices.filter((price) => new Date(price[0]) <= date);
          const lastPrice = prices.slice(-1)[0];
          if (!lastPrice) throw new Error("Failed to get the price.");
          resolve(lastPrice[1]);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

export default async function ({ date, ticker }) {
  const tickerId = await tickerToId(ticker);
  return await getPrice({ date, tickerId });
}
