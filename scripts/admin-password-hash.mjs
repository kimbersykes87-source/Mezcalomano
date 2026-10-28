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
    const onData = (chunk) => {
      // A paste arrives as one chunk, so go through it character by character and
      // stop at the first Enter (a pasted trailing newline must not become part of the password).
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n" || ch === "\u0004") {
          if (stdin.isTTY) stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        } else if (ch === "\u0003") {
          process.exit(1);
        } else if (ch === "\u007f" || ch === "\b") {
          value = value.slice(0, -1);
        } else {
          value += ch;
        }
      }
    };
    stdin.on("data", onData);
  });
}

if (process.argv[2] === "--check") {
  // Test a hash against a password without changing anything: paste the hash, then the password.
  const stored = (await readHidden("Paste the ADMIN_PASSWORD_HASH value: ")).trim();
  const typed = await readHidden("Password: ");
  const [tag, n, r, p, saltHex, hashHex] = stored.split("$");
  if (tag !== "scrypt" || !hashHex) {
    console.log("That is not a valid hash (it should start with scrypt$ and have 6 parts).");
    process.exit(1);
  }
  const expected = Buffer.from(hashHex, "hex");
  const got = scryptSync(typed, Buffer.from(saltHex, "hex"), expected.length, { N: Number(n), r: Number(r), p: Number(p) });
  console.log(got.equals(expected) ? "MATCH: this hash belongs to that password." : "NO MATCH: the hash and password do not go together.");
  process.exit(0);
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
