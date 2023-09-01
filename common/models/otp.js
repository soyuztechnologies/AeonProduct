'use strict';
module.exports = function(otp) {
    otp.observe('before save', function(ctx, next) {
        if (ctx.isNewInstance) {
            ctx.instance.CreatedOn = new Date(); // Set the "CreatedOn" property to the current date
            
        } else {
            ctx.data.UpdatedOn = new Date(); // Set the "UpdatedOn" property to the current date
        }
        next(); // Continue with the save/update operation
    });
};