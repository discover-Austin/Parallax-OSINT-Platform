#!/usr/bin/env node

const nacl = require('tweetnacl');
const util = require('tweetnacl-util');

console.log('\n=== Parallax License Key Pair Generator ===\n');

const keypair = nacl.sign.keyPair();

const publicKey = util.encodeBase64(keypair.publicKey);
const secretKey = util.encodeBase64(keypair.secretKey);

console.log('PUBLIC KEY (add to .env as LICENSE_PUBLIC_KEY and to Rust build.rs):');
console.log(publicKey);

console.log('\nSECRET KEY (add to .env as LICENSE_SECRET_KEY - KEEP SECRET!):');
console.log(secretKey);

console.log('\n⚠️  WARNING: Keep the secret key safe and never commit it to version control!\n');

console.log('Add to your .env file:');
console.log(`LICENSE_PUBLIC_KEY=${publicKey}`);
console.log(`LICENSE_SECRET_KEY=${secretKey}`);

console.log('\nFor Rust build, set environment variable:');
console.log(`export PARALLAX_LICENSE_PUBLIC_KEY="${publicKey}"`);
console.log('\n');
