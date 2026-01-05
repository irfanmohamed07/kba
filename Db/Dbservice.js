import pool from './index.js';  // Import the pool from db/index.js
import bcrypt from 'bcrypt';
export const saveHousekeeping = async (data) => {
    try {
        const query = `
            INSERT INTO housekeeping_requests (name, rrn, block, room_number, maintenance_done, status)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const values = [
            data.name,
            data.rrn,
            data.block,
            data.room_number,
            data.maintenance_done,
            data.status
        ];

        await pool.query(query, values); // Execute the query to save the data
    } catch (error) {
        console.error("Error saving housekeeping request:", error);
        throw error; // Propagate error for handling in the route
    }
};
// // Save gate pass in the database
// export const saveGatepass = async (data) => {
//     try {
//         // First, fetch the rtid from the users table using rrn
//         const rtidQuery = `SELECT rtid FROM users WHERE rrn = $1`;
//         const rtidResult = await pool.query(rtidQuery, [data.rrn]);

//         if (rtidResult.rowCount === 0) {
//             throw new Error(`No user found with RRN: ${data.rrn}`);
//         }

//         const rtid = rtidResult.rows[0].rtid;

//         // Now insert the gatepass with the fetched rtid
//         const gatepassQuery = `
//             INSERT INTO gatepasses (name, rrn, degree, block_room, time_out, time_in, reason, student_contact, parent_contact, rt_name, status, rtid)
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
//         `;
//         await pool.query(gatepassQuery, [
//             data.name,
//             data.rrn,
//             data.degree,
//             data.block_room,
//             data.time_out,
//             data.time_in,
//             data.reason,
//             data.student_contact,
//             data.parent_contact,
//             data.rt_name,
//             data.status,
//             rtid
//         ]);

//     } catch (error) {
//         console.error('Error saving gate pass:', error);
//         throw error;
//     }
// };


 
// In dbservice.js (or wherever you have the database logic)
export const getPendingGatepasses = async () => {
    try {
        const result = await pool.query('SELECT * FROM gatepasses WHERE status = $1', ['pending']);  // Assuming status is a field that determines pending gate passes.
        console.log("Fetched Gatepass Requests:", result.rows);  // Debugging the result
        return result.rows;  // Return the rows from the query
    } catch (error) {
        console.error("Error fetching gatepass requests:", error);
        throw error;
    }
};
export const getGatepassRequestsByRTID = async (rtid) => {
    const result = await pool.query("SELECT * FROM gatepasses WHERE rtid = $1", [rtid]);
    return result.rows;
};

// Update the gatepass status (approve/reject)
// Function to update gate pass status in the database
export const updateGatepassStatus = async (gatepassId, status) => {
    try {
        const query = 'UPDATE gatepasses SET status = $1 WHERE id = $2';
        const values = [status, gatepassId];

        await db.query(query, values);
    } catch (error) {
        console.error('Error updating gate pass status:', error);
        throw error;
    }
};


// Get gatepass by ID
export const getGatepassById = async (id) => {
    const query = `SELECT * FROM gatepasses WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];  // Return the gatepass by ID
  };
  
// Fetch all gate passes
export const getAllGatepassRequests = async () => {
    const query = 'SELECT * FROM gatepasses';
    const result = await pool.query(query);
    return result.rows;
};
export const getGatePassDetails = async (gatepassId) => {
    try {
        const query = 'SELECT * FROM gatepasses WHERE id = $1';
        const result = await pool.query(query, [gatepassId]);

        if (result.rows.length === 0) {
            throw new Error(`No gate pass found with ID ${gatepassId}`);
        }

        return result.rows[0];  // Return the first matching record
    } catch (error) {
        console.error('Error fetching gate pass details:', error);
        throw error;
    }
};

// Fetch pending housekeeping requests (maintenance_done = false and status = 'pending')
export const getPendingHousekeepingRequests = async () => {
    const query = 'SELECT id, name, rrn, block, room_number, maintenance_done, status FROM housekeeping_requests WHERE status = $1';
    const values = ['pending'];

    try {
        const { rows } = await pool.query(query, values);
        return rows; // Returns an array of pending housekeeping requests
    } catch (error) {
        console.error('Error fetching pending housekeeping requests:', error);
        return []; // Return an empty array if there’s an error
    }
};


// Fetch completed housekeeping requests (maintenance_done = true or status = 'completed')
export const getCompletedHousekeepingRequests = async () => {
    const query = "SELECT * FROM housekeeping_requests WHERE maintenance_done = true OR status = 'completed'";
    const { rows } = await pool.query(query);
    return rows;
};

// Update housekeeping request status
export const updateHousekeepingRequestStatus = async (id, completed) => {
    const query = "UPDATE housekeeping_requests SET maintenance_done = $1, status = $2 WHERE id = $3";
    const values = [completed, completed ? 'completed' : 'pending', id];
    await pool.query(query, values);
};

// dbservice.js

// Fetch pending electrical work requests
export const getPendingElectricalRequests = async () => {
    const result = await pool.query('SELECT * FROM electrical_work_requests WHERE status = $1', ['pending']);
    return result.rows;
};

// Fetch completed electrical work requests
export const getCompletedElectricalRequests = async () => {
    const result = await pool.query('SELECT * FROM electrical_work_requests WHERE status = $1', ['completed']);
    return result.rows;
};

// Update the status of an electrical work request
export const updateElectricalRequestStatus = async (id, completed) => {
    const query = "UPDATE electrical_work_requests SET maintenance_done = $1, status = $2 WHERE id = $3";
    const values = [completed, completed ? 'completed' : 'pending', id];
    await pool.query(query, values);
};


export const fetchPendingRequests = async () => {
    const result = await pool.query('SELECT * FROM housekeeping_requests WHERE status = $1', ['pending']);
    return result.rows;
};

// Register a new user
export const registerUser = async (name, parent_mob_num, email, password, rtId,rrn) => {
    // Check if email already exists
    const checkEmailQuery = `SELECT * FROM users WHERE email = $1`;
    const checkEmailValues = [email];

    try {
        const { rowCount } = await pool.query(checkEmailQuery, checkEmailValues);

        if (rowCount > 0) {
            throw new Error("Email already exists"); // Custom error message
        }

        // Hash the password with 10 salt rounds before inserting
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user if email does not exist
        const insertQuery = `
            INSERT INTO users (name, parent_mob_num, email, password, rtId,rrn) 
            VALUES ($1, $2, $3, $4, $5,$6)
        `;
        const values = [name, parent_mob_num, email, hashedPassword, rtId,rrn];
        await pool.query(insertQuery, values);

    } catch (error) {
        throw error; // Propagate the error
    }
};

// In your dbservice.js or appropriate database service file
export const deleteUser = async (userId) => {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    if (result.rowCount === 0) {
        throw new Error('User not found'); // Handle the case where the user does not exist
    }
    return result;
};


// Register an RT
export const registerRT = async (rtid, name, email, password) => {
    try {
        // Check if the provided RT ID already exists
        const existingRT = await pool.query('SELECT * FROM rt WHERE rtid = $1', [rtid]);
        
        if (existingRT.rows.length > 0) {
            throw new Error('RT ID already exists. Please choose a different ID.');
        }

        // Hash the password
        const saltRounds = 10;  // Number of salt rounds for bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new RT record with the hashed password
        const result = await pool.query(
            'INSERT INTO rt (rtid, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *', 
            [rtid, name, email, hashedPassword]
        );

        return result.rows[0];  // Return the newly created RT record
    } catch (err) {
        throw new Error(`Registration failed: ${err.message}`);
    }
};

export const deleteRtUser = async (rtUserId) => {
    console.log(`Attempting to delete RT user with ID: ${rtUserId}`); // Debug log
    const result = await pool.query('DELETE FROM rt WHERE rtid = $1', [rtUserId]);
    if (result.rowCount === 0) {
        throw new Error('RT user not found');
    }
    return result;
};


// Handle user login
export const loginUser = async (email, password) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    return result.rows[0]; // Return user if found
};

export const getRtUser = async ()=>{
    try {
        const result= await pool.query('SELECT * FROM rt')
        return result.rows
    }
    catch{
        console.log('Error fetching rt',error);
        throw error;
    }
};

// Function to update housekeeping request
export const updateHousekeepingRequest = async (id, completed) => {
    const maintenanceDone = completed === 'on'; // Convert checkbox state to boolean
    await pool.query('UPDATE housekeeping_requests SET maintenance_done = $1 WHERE id = $2', [maintenanceDone, id]);
  };
  
  // Function to update electrical request
  export const updateElectricalRequest = async (id, completed) => {
    const maintenanceDone = completed === 'on'; // Convert checkbox state to boolean
    await pool.query('UPDATE electrical_requests SET maintenance_done = $1 WHERE id = $2', [maintenanceDone, id]);
  };
  export const getAllUsers = async () => {
    try {
        const result = await pool.query('SELECT * FROM users'); // Adjust the query if needed
        return result.rows; // Return the rows from the query result
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error; // Throw error to be handled by calling function
    }
};

// Function to get all login attempts
export const getLoginAttempts = async () => {
    try {
        const result = await pool.query('SELECT * FROM logins'); // Adjust the query if needed
        return result.rows; // Return the rows from the query result
        console.log(result.rows);
    } catch (error) {
        console.error('Error fetching login attempts:', error);
        throw error; // Throw error to be handled by calling function
    }
};
export const registerManager = async (username, password, email) => {
    const query = `
        INSERT INTO admin (username, password, email)
        VALUES ($1, $2, $3)
    `;
    const values = [username, password, email];

    await pool.query(query, values);
};

export async function deleteRT(rtId) {
    try {
        const query = 'DELETE FROM rt WHERE rtid = $1 RETURNING *';
        const result = await pool.query(query, [rtId]);

        if (result.rowCount === 0) {
            throw new Error('RT not found');
        }

        return result.rows[0]; // Return the deleted row for confirmation
    } catch (error) {
        console.error(`Error deleting RT with ID ${rtId}:`, error.message);
        throw error;
    }
}




// Fetch pending carpentry requests
export const getPendingCarpentryRequests = async () => {
    const result = await pool.query('SELECT * FROM carpentry_requests WHERE status = $1', ['pending']);
    return result.rows;
};

// Fetch completed carpentry work requests
export const getCompletedCarpentryRequests = async () => {
    const result = await pool.query('SELECT * FROM carpentry_requests WHERE status = $1', ['completed']);
    return result.rows;
};

// Update the status of a carpentry work request
export const updateCarpentryRequestStatus = async (id, completed) => {
    const query = "UPDATE carpentry_requests SET maintenance_done = $1, status = $2 WHERE id = $3";
    const values = [completed, completed ? 'completed' : 'pending', id];
    await pool.query(query, values);
};
