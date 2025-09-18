'use strict';
module.exports = function(Job) {
    // Register a "before save" hook for the Job model
    Job.observe('before save', function(ctx, next) {
        if (ctx.isNewInstance) {
            ctx.instance.CreatedOn = new Date(); // Set the "CreatedOn" property to the current date
            
        }  else {
           if (ctx.instance) {
                    ctx.instance.UpdatedOn = new Date();
                } else {
                    ctx.data.UpdatedOn = new Date();
                } // Set the "UpdatedOn" property to the current date
        }
        next(); // Continue with the save/update operation
    });
};


