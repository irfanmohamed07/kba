import express from 'express';
import pool from '../Db/index.js';
import bcrypt from 'bcrypt';

const router=express.Router();


router.get('/maintenanceadminpanel',(req,res)=>{
  if(req.session.isMaintenanceAdminAuthenticated){
         
    pool.query('SELECT * FROM housekeeping_requests WHERE status = $1', ['pending'], (pendinghousekeeping_requestsError, pendinghousekeeping_requestsResult) => {
        if (pendinghousekeeping_requestsError) {
          console.error("Error fetching users: ", pendinghousekeeping_requestsError);
          res.status(500).send("Internal Server Error");
          return;
        }
        pool.query('SELECT * FROM housekeeping_requests WHERE status = $1', ['completed'], (completedhousekeeping_requestsError, completedhousekeeping_requestsResult) => {
            if (completedhousekeeping_requestsError) {
              console.error("Error fetching users: ", completedhousekeeping_requestsError);
              res.status(500).send("Internal Server Error");
              return;
            }
            pool.query('SELECT * FROM electrical_work_requests WHERE status = $1', ['pending'], (pendingelectrical_work_requestsError, pendingelectrical_work_requestsResult) => {
                if (pendingelectrical_work_requestsError) {
                  console.error("Error fetching users: ", pendingelectrical_work_requestsError);
                  res.status(500).send("Internal Server Error");
                  return;
                }
                pool.query('SELECT * FROM electrical_work_requests WHERE status = $1', ['completed'], (completedelectrical_work_requestsError,completedelectrical_work_requestsResult) => {
                  if (completedelectrical_work_requestsError) {
                    console.error("Error fetching users: ", completedelectrical_work_requestsError);
                    res.status(500).send("Internal Server Error");
                    return;
                  }
                  pool.query('SELECT * FROM carpentry_requests WHERE status = $1', ['pending'], (pendingcarpentry_requestsError,pendingcarpentry_requestsResult) => {
                    if (pendingcarpentry_requestsError) {
                      console.error("Error fetching users: ", pendingcarpentry_requestsError);
                      res.status(500).send("Internal Server Error");
                      return;
                    }
                  pool.query('SELECT * FROM carpentry_requests WHERE status = $1', ['completed'], (completedcarpentry_requestsError,completedcarpentry_requestsResult) => {
                    if (completedcarpentry_requestsError) {
                      console.error("Error fetching users: ", completedcarpentry_requestsError);
                      res.status(500).send("Internal Server Error");
                      return;
                    }
                    pool.query('SELECT * FROM medical_requests WHERE status = $1', ['pending'], (pendingmedical_requestsError,pendingmedical_requestsResult) => {
                      if (pendingmedical_requestsError) {
                        console.error("Error fetching users: ", pendingmedical_requestsError);
                        res.status(500).send("Internal Server Error");
                        return;
                      }
                    pool.query('SELECT * FROM medical_requests WHERE status = $1', ['completed'], (completedmedical_requestsError,completedmedical_requestsResult) => {
                      if (completedmedical_requestsError) {
                        console.error("Error fetching users: ", completedmedical_requestsError);
                        res.status(500).send("Internal Server Error");
                        return;
                      }
                                   res.render('maintenanceadminpanel',{
                                    pendinghousekeeping_requests:pendinghousekeeping_requestsResult.rows,
                                    completedhousekeeping_requests:completedhousekeeping_requestsResult.rows,  
                                    pendingelectrical_work_requests:pendingelectrical_work_requestsResult.rows,
                                    completedelectrical_work_requests:completedelectrical_work_requestsResult.rows,
                                    pendingcarpentry_requests:pendingcarpentry_requestsResult.rows,
                                    completedcarpentry_requests:completedcarpentry_requestsResult.rows,
                                    pendingmedical_requests:pendingmedical_requestsResult.rows,
                                    completedmedical_requests:completedmedical_requestsResult.rows
                                });
                              });     
                            });
                          });
                        });
                    });
                  });
                });
              });
            }
            else{
              res.redirect('/maintenanceadmin');
            }
            });

router.post('/approvehousekeeping/:id', async (req, res) => {
              const { id } = req.params;
          
              try {
                  // Update maintenance_done to true and set status to 'Completed'
                  await pool.query(
                      'UPDATE housekeeping_requests SET maintenance_done = $1, status = $2 WHERE id = $3',
                      [true, 'completed', id]
                  );
          
                  // Redirect back to pending requests view
                  res.redirect('/maintenanceadminpanel');
              } catch (error) {
                  console.error('Error updating housekeeping request:', error);
                  res.status(500).send('Internal Server Error');
              }
  }); 

  router.post('/approveelectricalwork/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Update maintenance_done to true and set status to 'Completed'
        await pool.query(
            'UPDATE electrical_work_requests SET maintenance_done = $1, status = $2 WHERE id = $3',
            [true, 'completed', id]
        );

        // Redirect back to pending requests view
        res.redirect('/maintenanceadminpanel');
    } catch (error) {
        console.error('Error updating housekeeping request:', error);
        res.status(500).send('Internal Server Error');
    }
}); 
 
router.post('/approvecarpentrywork/:id', async (req, res) => {
  const { id } = req.params;

  try {
      // Update maintenance_done to true and set status to 'Completed'
      await pool.query(
          'UPDATE  carpentry_requests SET maintenance_done = $1, status = $2 WHERE id = $3',
          [true, 'completed', id]
      );

      // Redirect back to pending requests view
      res.redirect('/maintenanceadminpanel');
  } catch (error) {
      console.error('Error updating housekeeping request:', error);
      res.status(500).send('Internal Server Error');
  }
});
   

router.post('/changemaintenancepassword', async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Check if the admin email is available in the session
  const maintenanceadminEmail = req.session.maintenanceadmin?.email; // Ensure session middleware is properly set up
  if (!maintenanceadminEmail) {
    return res.send("Session expired. Please log in again.");
  }

  try {
    // Fetch the current hashed password for the admin using the email from session
    const result = await pool.query('SELECT password FROM maintenanceuser WHERE email = $1', [maintenanceadminEmail]);
    if (result.rows.length === 0) {
      return res.send("Admin account not found");
    }

    const currentHashedPassword = result.rows[0].password;

    // Compare the old password with the stored hashed password
    const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
    if (!isMatch) {
      return res.send("Old password is incorrect" );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10); // Default salt rounds = 10

    // Update the password in the database for the admin with the session's email
    await pool.query('UPDATE maintenanceuser SET password = $1 WHERE email = $2', [hashedNewPassword, maintenanceadminEmail]);

    // Redirect to admin dashboard or login page after successful password update
    res.redirect('/maintenanceadminpanel');
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).send("Internal server error");
  }
});



export default router;