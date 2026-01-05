import express from "express";
import pool from "../Db/index.js";
import bcrypt from "bcrypt";

const router = express.Router();
const saltRound = 10;

router.get("/managementadminpanel", (req, res) => {
  if (req.session.isManagementAdminAuthenticated) {
    pool.query("SELECT * FROM users", (userError, userResult) => {
      if (userError) {
        console.error("Error fetching users: ", userError);
        res.status(500).send("Internal Server Error");
        return;
      }
      pool.query("SELECT * FROM users", (usersError, usersResult) => {
        if (userError) {
          console.error("Error fetching users: ", usersError);
          res.status(500).send("Internal Server Error");
          return;
        }
        pool.query("SELECT * FROM logins", (loginsError, loginsResult) => {
          if (userError) {
            console.error("Error fetching users: ", loginsError);
            res.status(500).send("Internal Server Error");
            return;
          }
          pool.query("SELECT * FROM rt", (rtError, rtResult) => {
            if (userError) {
              console.error("Error fetching users: ", rtError);
              res.status(500).send("Internal Server Error");
              return;
            }
            pool.query(
              "SELECT * FROM rtlogins",
              (rtloginsError, rtloginsResult) => {
                if (userError) {
                  console.error("Error fetching users: ", rtloginsError);
                  res.status(500).send("Internal Server Error");
                  return;
                }
                pool.query(
                  "SELECT * FROM maintenanceuser",
                  (maintenanceuserError, maintenanceuserResult) => {
                    if (maintenanceuserError) {
                      console.error(
                        "Error fetching users: ",
                        maintenanceuserError
                      );
                      res.status(500).send("Internal Server Error");
                      return;
                    }
                    pool.query(
                      "SELECT * FROM maintenanceuserlogins",
                      (
                        maintenanceuserloginsError,
                        maintenanceuserloginsResult
                      ) => {
                        if (maintenanceuserloginsError) {
                          console.error(
                            "Error fetching users: ",
                            maintenanceuserloginsError
                          );
                          res.status(500).send("Internal Server Error");
                          return;
                        }

                        pool.query(
                          "SELECT * FROM gatepasses WHERE status = $1",
                          ["departed"],
                          (gatepassesError, gatepassesResult) => {
                            if (gatepassesError) {
                              console.error(
                                "Error fetching users: ",
                                gatepassesError
                              );
                              res.status(500).send("Internal Server Error");
                              return;
                            }
                            pool.query(
                              "SELECT * FROM housekeeping_requests WHERE status = $1",
                              ["completed"],
                              (
                                housekeeping_requestsError,
                                housekeeping_requestsResult
                              ) => {
                                if (housekeeping_requestsError) {
                                  console.error(
                                    "Error fetching users: ",
                                    housekeeping_requestsError
                                  );
                                  res.status(500).send("Internal Server Error");
                                  return;
                                }
                                pool.query(
                                  "SELECT * FROM electrical_work_requests WHERE status = $1",
                                  ["completed"],
                                  (
                                    electrical_work_requestsError,
                                    electrical_work_requestsResult
                                  ) => {
                                    if (electrical_work_requestsError) {
                                      console.error(
                                        "Error fetching users: ",
                                        electrical_work_requestsError
                                      );
                                      res
                                        .status(500)
                                        .send("Internal Server Error");
                                      return;
                                    }
                                    pool.query(
                                      "SELECT * FROM carpentry_requests WHERE status = $1",
                                      ["completed"],
                                      (
                                        carpentry_requestsError,
                                        carpentry_requestsResult
                                      ) => {
                                        if (carpentry_requestsError) {
                                          console.error(
                                            "Error fetching users: ",
                                            carpentry_requestsError
                                          );
                                          res
                                            .status(500)
                                            .send("Internal Server Error");
                                          return;
                                        }
                                        pool.query(
                                          "SELECT * FROM medical_requests WHERE status = $1",
                                          ["completed"],
                                          (
                                            medical_requestsError,
                                            medical_requestsResult
                                          ) => {
                                            if (medical_requestsError) {
                                              console.error(
                                                "Error fetching users: ",
                                                medical_requestsError
                                              );
                                              res
                                                .status(500)
                                                .send("Internal Server Error");
                                              return;
                                            }
                                            pool.query(
                                              "SELECT * FROM admin",
                                              (adminError, adminResult) => {
                                                if (adminError) {
                                                  console.error(
                                                    "Error fetching users: ",
                                                    adminError
                                                  );
                                                  res
                                                    .status(500)
                                                    .send(
                                                      "Internal Server Error"
                                                    );
                                                  return;
                                                }
                                                pool.query(
                                                  "SELECT * FROM admin_logins",
                                                  (
                                                    admin_loginsError,
                                                    admin_loginsResult
                                                  ) => {
                                                    if (admin_loginsError) {
                                                      console.error(
                                                        "Error fetching users: ",
                                                        admin_loginsError
                                                      );
                                                      res
                                                        .status(500)
                                                        .send(
                                                          "Internal Server Error"
                                                        );
                                                      return;
                                                    }
                                                    res.render(
                                                      "managementadminpanel",
                                                      {
                                                        users: userResult.rows,
                                                        logins:
                                                          loginsResult.rows,
                                                        rt: rtResult.rows,
                                                        rtlogins:
                                                          rtloginsResult.rows,
                                                        maintenanceuser:
                                                          maintenanceuserResult.rows,
                                                        maintenanceuserlogins:
                                                          maintenanceuserloginsResult.rows,
                                                        gatepasses:
                                                          gatepassesResult.rows,
                                                        housekeeping_requests:
                                                          housekeeping_requestsResult.rows,
                                                        electrical_work_requests:
                                                          electrical_work_requestsResult.rows,
                                                        carpentry_requests:
                                                          carpentry_requestsResult.rows,
                                                        medical_requests:
                                                          medical_requestsResult.rows,
                                                        admin: adminResult.rows,
                                                        admin_logins:
                                                          admin_loginsResult.rows,
                                                      }
                                                    );
                                                  }
                                                );
                                              }
                                            );
                                          }
                                        );
                                      }
                                    );
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          });
        });
      });
    });
  } else {
    res.redirect("/managementadmin");
  }
});

router.post("/deleteuser/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1", [
      userId,
    ]);

    if (result.rowCount > 0) {
      res.redirect("/managementadminpanel");
    } else {
      res.status(404).send("User not found.");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/deleteuserlogins/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query("DELETE FROM logins WHERE id = $1", [
      userId,
    ]);

    if (result.rowCount > 0) {
      res.redirect("/managementadminpanel");
    } else {
      res.status(404).send("logins not found.");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/deletertuser/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query("DELETE FROM rt WHERE rtid = $1", [userId]);

    if (result.rowCount > 0) {
      res.redirect("/managementadminpanel");
    } else {
      res.status(404).send("logins not found.");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Internal Server Error");
  }
});
router.post("/deletemaintenanceuser/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM maintenanceuser WHERE id = $1",
      [userId]
    );

    if (result.rowCount > 0) {
      res.redirect("/managementadminpanel");
    } else {
      res.status(404).send("logins not found.");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Internal Server Error");
  }
});
router.post("/deletemaintenanceuserlogins/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query(
      "DELETE FROM maintenanceuserlogins WHERE id = $1",
      [userId]
    );

    if (result.rowCount > 0) {
      res.redirect("/managementadminpanel");
    } else {
      res.status(404).send("logins not found.");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/registeruser", async (req, res) => {
  const {
    name,
    rrn,
    parent_email,
    email,
    password,
    parent_mob_num,
    student_mob_num,
    rtid,
  } = req.body;
  try {
    const checkResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const checkResult1 = await pool.query(
      "SELECT * FROM users WHERE rrn = $1",
      [rrn]
    );

    if (checkResult1.rows.length > 0) {
      res.status(404).send("RRN already exist.");
    }

    if (checkResult.rows.length > 0) {
      res.status(404).send("Email already exist.");
    } else {
      bcrypt.hash(password, saltRound, async (error, hash) => {
        const result = await pool.query(
          "INSERT INTO users (name,rrn,parent_email,email,password,parent_mob_num,student_mob_num,rtid) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
          [
            name,
            rrn,
            parent_email,
            email,
            hash,
            parent_mob_num,
            student_mob_num,
            rtid,
          ]
        );
        res.redirect("/managementadminpanel");
      });
    }
  } catch (error) {
    res.status(404).send("error occured contact admin");
  }
});

router.post("/registerrt", async (req, res) => {
  const { name, rtid, email, password, rt_mob_num } = req.body;
  try {
    const checkResult = await pool.query("SELECT * FROM rt WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.status(404).send("Email already exist.");
    } else {
      bcrypt.hash(password, saltRound, async (error, hash) => {
        const result = await pool.query(
          "INSERT INTO rt (name,rtid,email,password,rt_mob_num) VALUES ($1,$2,$3,$4,$5)",
          [name, rtid, email, hash, rt_mob_num]
        );
        res.redirect("/managementadminpanel");
      });
    }
  } catch (error) {
    res.status(404).send("error occured contact admin");
  }
});

router.post("/registermaintenance", async (req, res) => {
  const { id, name, email, password } = req.body;
  try {
    const checkResult = await pool.query(
      "SELECT * FROM maintenanceuser WHERE email = $1",
      [email]
    );

    if (checkResult.rows.length > 0) {
      res.status(404).send("Email already exist.");
    } else {
      bcrypt.hash(password, saltRound, async (error, hash) => {
        const result = await pool.query(
          "INSERT INTO maintenanceuser (id,name,email,password) VALUES ($1,$2,$3,$4)",
          [id, name, email, hash]
        );
        res.redirect("/managementadminpanel");
      });
    }
  } catch (error) {
    res.status(404).send("error occured contact admin");
  }
});

router.post("/changemanagementpassword", async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Check if the admin email is available in the session
  const adminEmail = req.session.managementadmin?.email; // Ensure session middleware is properly set up
  if (!adminEmail) {
    return res.send("Session expired. Please log in again.");
  }

  try {
    // Fetch the current hashed password for the admin using the email from session
    const result = await pool.query(
      "SELECT password FROM admin WHERE email = $1",
      [adminEmail]
    );
    if (result.rows.length === 0) {
      return res.send("Admin account not found");
    }

    const currentHashedPassword = result.rows[0].password;

    // Compare the old password with the stored hashed password
    const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
    if (!isMatch) {
      return res.send("Old password is incorrect");
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10); // Default salt rounds = 10

    // Update the password in the database for the admin with the session's email
    await pool.query("UPDATE admin SET password = $1 WHERE email = $2", [
      hashedNewPassword,
      adminEmail,
    ]);

    // Redirect to admin dashboard or login page after successful password update
    res.redirect("/managementadminpanel");
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/registermanagementuser", async (req, res) => {
  const { username, id, email, password } = req.body;

  try {
    const checkResult = await pool.query(
      "SELECT * FROM admin WHERE email = $1",
      [email]
    );

    if (checkResult.rows.length > 0) {
      res.status(404).send("Email already exist.");
    } else {
      bcrypt.hash(password, saltRound, async (error, hash) => {
        const result = await pool.query(
          "INSERT INTO admin (username,id,email,password) VALUES ($1,$2,$3,$4)",
          [username, id, email, hash]
        );
        res.redirect("/managementadminpanel");
      });
    }
  } catch (error) {
    res.status(404).send("error occured contact admin");
  }
});

router.post("/deletemanagementadminusers/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await pool.query("DELETE FROM admin WHERE id = $1", [
      userId,
    ]);

    if (result.rowCount > 0) {
      res.redirect("/managementadminpanel");
    } else {
      res.status(404).send("email not found.");
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
