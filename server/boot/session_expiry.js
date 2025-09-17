module.exports = function (app) {
  const AccessToken = app.models.AccessToken;

  setInterval(() => {
    const now = new Date();
    const cutoff = new Date(now - 24 * 60 * 60 * 1000); // session expire time 24 hours

    AccessToken.destroyAll({ created: { lt: cutoff } }, (err, info) => {
      if (err) {
        console.log("Error deleting expired tokens:", err);
        return;
      }

      if (info && info.count > 0) {
        console.log(`Session expired`);
      }
    });
  }, 60 * 60 * 1000); // session expire check in every 60 minutes
};