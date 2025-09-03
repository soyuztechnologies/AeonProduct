module.exports = function (app) {
  const AccessToken = app.models.AccessToken;

  setInterval(() => {
    const now = new Date();
    const cutoff = new Date(now - 30 * 60 * 1000); // session expire time 30 minutes

    AccessToken.destroyAll({ updated: { lt: cutoff } }, (err, info) => {
      if (err) {
        console.log("Error deleting expired tokens:", err);
        return;
      }

      if (info && info.count > 0) {
        console.log(`Session expired`);
      }
    });
  }, 5 * 60 * 1000); // session expire check in every 5 minutes
};