'use strict';
module.exports = function(JobStatus) {
    JobStatus.observe('before save', function(ctx, next) {
        if (ctx.isNewInstance) {
            ctx.instance.CreatedOn = new Date(); 
        } else {
            ctx.data.UpdatedOn = new Date();
        }
        next(); // Continue with the save/update operation
    });
};