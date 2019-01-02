const crypto = require('crypto');
const token = 'auth5cur3';
const secret = 'x9O1LkXjyxpRiyhNRX8T';
class Auth{
    getSignature(body){
        return crypto.createHmac('sha256', secret).update(body).digest('hex');
    }

    generate(body){
        return'Ganesha ' + Buffer.from(token + ':' + this.getSignature(body)).toString('base64');
    }
}

const auth = new Auth('auth5cur3', 'x9O1LkXjyxpRiyhNRX8T');

module.exports = auth;
