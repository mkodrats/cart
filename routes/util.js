const request = require('request');
const auth = require('./pnauth');

function doRequest(req, callback){
    let reqString = JSON.stringify(req);

    request(
        {
            headers: {
                Authorization: auth.generate(reqString)
            },
            uri: 'http://localhost:8100/pointslink',
            method: 'POST',
            body: reqString,
            ContentType: 'application/json'
        },
        (err, response, body) => {
            if(!err){
                if(body.trim() === 'UNAUTHORIZED'){
                    callback(null, body.trim());
                    return;
                }
                let errors = JSON.parse(body);
                if(errors.errors){
                    callback(errors.errors, null);
                    return;
                }
                if(response.statusCode !== 200){
                    callback(body, null);
                    return;
                }
                let result = JSON.parse(body);
                callback(null, result.data);
            }else{
                callback(err, null);
            }
        }
    );
}

module.exports = {
    doRequest: doRequest
};
