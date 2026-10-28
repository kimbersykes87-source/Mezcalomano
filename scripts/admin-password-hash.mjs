#!/usr/bin/env node
/**
 * Makes the ADMIN_PASSWORD_HASH value for admin.mezcalomano.com.
 *
 *   node scripts/admin-password-hash.mjs
 *
 * Type the password (it is not shown), press Enter, then paste the printed line
 * into Vercel as ADMIN_PASSWORD_HASH (Sensitive, Production). The password itself
 * is never saved; keep it in your password manager. Also prints a fresh random
 * value you can use for ADMIN_SESSION_SECRET.
 */
import { randomBytes, scryptSync } from "node:crypto";

function readHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    const stdin = process.stdin;
    let value = "";
    if (stdin.isTTY) stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (ch) => {
      if (ch === "\r" || ch === "\n" || ch === "\u0004") {
        if (stdin.isTTY) stdin.setRawMode(false);
        stdin.pause();
        stdin.off("data", onData);
        process.stdout.write("\n");
        resolve(value);
      } else if (ch === "\u0003") {
        process.exit(1);
      } else if (ch === "\u007f" || ch === "\b") {
        value = value.slice(0, -1);
      } else {
        value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

const pw = await readHidden("Admin password (40+ characters): ");
if (pw.length < 40) {
  console.error(`That is ${pw.length} characters; use at least 40.`);
  process.exit(1);
}
const again = await readHidden("Type it again: ");
if (again !== pw) {
  console.error("The two entries did not match.");
  process.exit(1);
}

const N = 16384, r = 8, p = 1;
const salt = randomBytes(16);
const hash = scryptSync(pw, salt, 32, { N, r, p });
console.log("\nADMIN_PASSWORD_HASH:");
console.log(`scrypt$${N}$${r}$${p}$${salt.toString("hex")}$${hash.toString("hex")}`);
console.log("\nADMIN_SESSION_SECRET (if you do not have one yet):");
console.log(randomBytes(32).toString("hex"));
