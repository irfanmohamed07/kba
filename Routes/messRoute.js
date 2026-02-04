import express from "express";
import pool from "../Db/index.js";


const router = express.Router();

router.get('/api/mess-prediction', async (req, res) => {

    try {
        // Delegate to Python Mess Agent
        const response = await fetch('http://localhost:5003/predict-demand');

        if (response.ok) {
            const data = await response.json();
            return res.json(data);
        }

        throw new Error('Mess Agent error');

    } catch (error) {
        console.warn("Mess Agent unavailable, using local calculation fallback.");

        try {
            const today = new Date().toISOString().split('T')[0];
            const [totalStudentsResult, approvedGatepassesResult, medicalLeavesResult] = await Promise.all([
                pool.query("SELECT COUNT(*) FROM users"),
                pool.query("SELECT COUNT(*) FROM gatepasses WHERE status = 'approved' AND $1::date >= time_out::date AND $1::date <= time_in::date", [today]),
                pool.query("SELECT COUNT(*) FROM medical_requests WHERE status = 'pending' OR status = 'in-progress'")
            ]);

            const totalStudents = parseInt(totalStudentsResult.rows[0].count);
            const awayOnGatepass = parseInt(approvedGatepassesResult.rows[0].count);
            const onMedicalLeave = parseInt(medicalLeavesResult.rows[0].count);

            res.json({
                totalStudents,
                awayOnGatepass,
                onMedicalLeave,
                expectedAttendance: Math.max(0, totalStudents - (awayOnGatepass + onMedicalLeave)),
                date: today
            });
        } catch (innerError) {
            res.status(500).json({ error: "Failed to calculate mess demand locally" });
        }
    }
});

export default router;
