function errorHandler(err,req,res,next){
    if(res.headersSent){
        next("There was a problem")
    }
    else if(err){
        res.send(err.message)
    }
    else{
        res.send("wrong")
    }
}

module.exports = errorHandler