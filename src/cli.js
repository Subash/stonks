#!/usr/bin/env node
import stonks from "./stonks.js";

try {
  const args = process.argv.slice(2);

  let date = new Date();
  if (args.includes("--date")) {
    date = new Date(args.splice(args.indexOf("--date"), 2)[1]);
  }

  if (date.toString() === "Invalid Date") {
    throw new Error("Please provide a valid date.");
  }

  let ticker = args[0]?.toUpperCase();
  if (!ticker) throw new Error("Please provide a ticker symbol.");

  console.log(await stonks({ date, ticker }));
} catch (err) {
  process.exitCode = 1;
  console.error(err.message);
}
