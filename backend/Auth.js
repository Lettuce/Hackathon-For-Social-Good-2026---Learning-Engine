import crypto from 'node:crypto';

const hash = (password, salt) => crypto.scryptSync(password, salt, 32);

export const generateSaltedHash = (password) => {
    const salt = crypto.randomBytes(16).toString("hex");
    return {hash: hash(password, salt).toString("hex"), salt: salt};
};

export const verifyPassword = (password, hashed) => hash(password, hashed.salt).toString("hex")===hashed.hash;