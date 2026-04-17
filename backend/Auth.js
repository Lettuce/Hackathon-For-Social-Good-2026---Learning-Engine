import crypto from 'node:crypto';

export class RequestAuth {
    username;
    password;
    constructor({username, password}) {
        this.username = username;
        this.password = password;
    };
};

class PasswordSalt {
    salt;
    constructor(salt) {
        this.salt = salt;
    };
    hashPassword(password) {
        return crypto.scryptSync(password, this.salt, 32).toString("hex");
    };
    
    static generate() {
        return new PasswordSalt(crypto.randomBytes(16).toString("hex"));
    };
};

export class StoredAuth extends PasswordSalt {
    hash;
    constructor({hash, salt}) {
        super(salt);
        this.hash = hash;
    };
    
    verify({password}) {
        return this.hashPassword(password)===this.hash;
    };
    
    static generate({password}) {
        const salt = PasswordSalt.generate();
        return new StoredAuth({hash: salt.hashPassword(password), ...salt});
    };
};

// export default {RequestAuth, StoredAuth};