const jwt = require('jsonwebtoken');


module.exports = function verifyToken(req, res,next)
{   
    if(req.headers.authorization !== undefined)
    {
        let token = req.headers.authorization.split(" ")[1];
        jwt.verify(token,"secretkey",(err,data) => {
    
            if(err==null)
            {
                next();
            }
            else
            {
                res.send({message:"Invalid token Please Login Again"})
            }
        })

    }
    else
    {
        res.send({message:"Please provide a Token"})
    }

    
}