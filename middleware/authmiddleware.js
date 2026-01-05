export const checkAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect("/login");
};

export const checkManagementAdminAuthenticated = (req, res, next) => {
  // Check if the user is already authenticated as a management admin
  if (
    req.session.managementadmin &&
    req.session.managementadmin.role === "managementadmin"
  ) {
    // Prevent redirect to management admin panel if already authenticated
    if (req.path === "/managementadmin") {
      return res.redirect("/managementadminpanel"); // Redirect to panel if already logged in
    }
  }
  return next(); // Proceed to the next middleware or route handler
};

export const checkMaintenanceAdminAuthenticated = (req, res, next) => {
  // Check if the user is already authenticated as a management admin
  if (
    req.session.maintenanceadmin &&
    req.session.maintenanceadmin.role === "maintenanceadmin"
  ) {
    // Prevent redirect to management admin panel if already authenticated
    if (req.path === "/maintenanceadmin") {
      return res.redirect("/maintenanceadminpanel"); // Redirect to panel if already logged in
    }
  }
  return next(); // Proceed to the next middleware or route handler
};

export const checkRtAdminAuthenticated = (req, res, next) => {
  // Check if the user is already authenticated as a management admin
  if (req.session.rtadmin && req.session.rtadmin.role === "rtadmin") {
    // Prevent redirect to management admin panel if already authenticated
    if (req.path === "/rtadmin") {
      return res.redirect("/rtadminpanel"); // Redirect to panel if already logged in
    }
  }
  return next(); // Proceed to the next middleware or route handler
};

export const checkWatchmanAuthenticated = (req, res, next) => {
  if (req.session.watchman && req.session.watchman.role === "watchman") {
    // Prevent redirect to management admin panel if already authenticated
    if (req.path === "/watchman") {
      return res.redirect("/watchmanpanel"); // Redirect to panel if already logged in
    }
  }
  return next(); // Proceed to the next middleware or route handler
};
