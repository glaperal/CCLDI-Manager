const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');

// Validation middleware
const paymentValidation = [
  body('studentId').isInt().withMessage('Valid student ID is required'),
  body('type').isIn(['tuition', 'miscellaneous']).withMessage('Type must be tuition or miscellaneous'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentDate').isDate().withMessage('Valid payment date is required'),
  body('notes').optional().trim()
];

// GET all billing records with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { studentId, centerId, startDate, endDate } = req.query;

    let queryText = `
      SELECT b.*, s.first_name, s.last_name, s.center_id, c.name as center_name
      FROM billing b
      JOIN students s ON b.student_id = s.id
      LEFT JOIN centers c ON s.center_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (studentId) {
      paramCount++;
      queryText += ` AND b.student_id = $${paramCount}`;
      params.push(studentId);
    }

    if (centerId && centerId !== 'all') {
      paramCount++;
      queryText += ` AND s.center_id = $${paramCount}`;
      params.push(centerId);
    }

    if (startDate) {
      paramCount++;
      queryText += ` AND b.payment_date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      queryText += ` AND b.payment_date <= $${paramCount}`;
      params.push(endDate);
    }

    queryText += ' ORDER BY b.payment_date DESC, b.id DESC';

    const result = await query(queryText, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET aging report
router.get('/aging-report', async (req, res, next) => {
  try {
    const { centerId } = req.query;

    let queryText = `
      SELECT
        s.id as student_id,
        s.first_name,
        s.last_name,
        s.center_id,
        c.name as center_name,
        s.tuition,
        s.enrollment_date,
        COALESCE(SUM(b.amount), 0) as total_paid
      FROM students s
      LEFT JOIN billing b ON s.id = b.student_id
      LEFT JOIN centers c ON s.center_id = c.id
      WHERE s.status = 'active'
    `;
    const params = [];

    if (centerId && centerId !== 'all') {
      queryText += ' AND s.center_id = $1';
      params.push(centerId);
    }

    queryText += ' GROUP BY s.id, c.name ORDER BY s.last_name, s.first_name';

    const result = await query(queryText, params);

    // Calculate AR for each student
    const currentDate = new Date();
    const agingReport = result.rows.map(student => {
      const enrollmentDate = new Date(student.enrollment_date);
      const monthsSinceEnrollment = Math.floor(
        (currentDate - enrollmentDate) / (1000 * 60 * 60 * 24 * 30)
      );
      const expectedPayments = monthsSinceEnrollment + 1;
      const expectedTotal = student.tuition * expectedPayments;
      const totalPaid = parseFloat(student.total_paid);
      const outstanding = Math.max(0, expectedTotal - totalPaid);
      const monthsUnpaid = student.tuition > 0 ? Math.floor(outstanding / student.tuition) : 0;

      let current = 0, days30 = 0, days60 = 0, days90Plus = 0;

      if (outstanding > 0) {
        if (monthsUnpaid === 0) {
          current = outstanding;
        } else if (monthsUnpaid === 1) {
          days30 = outstanding;
        } else if (monthsUnpaid === 2) {
          days60 = outstanding;
        } else {
          days90Plus = outstanding;
        }
      }

      return {
        studentId: student.student_id,
        studentName: `${student.first_name} ${student.last_name}`,
        centerName: student.center_name,
        centerId: student.center_id,
        totalOutstanding: parseFloat(outstanding.toFixed(2)),
        current: parseFloat(current.toFixed(2)),
        days30: parseFloat(days30.toFixed(2)),
        days60: parseFloat(days60.toFixed(2)),
        days90Plus: parseFloat(days90Plus.toFixed(2))
      };
    }).filter(item => item.totalOutstanding > 0)
      .sort((a, b) => b.totalOutstanding - a.totalOutstanding);

    const totals = agingReport.reduce((acc, item) => ({
      totalOutstanding: acc.totalOutstanding + item.totalOutstanding,
      current: acc.current + item.current,
      days30: acc.days30 + item.days30,
      days60: acc.days60 + item.days60,
      days90Plus: acc.days90Plus + item.days90Plus
    }), { totalOutstanding: 0, current: 0, days30: 0, days60: 0, days90Plus: 0 });

    res.json({
      success: true,
      count: agingReport.length,
      data: agingReport,
      totals: {
        totalOutstanding: parseFloat(totals.totalOutstanding.toFixed(2)),
        current: parseFloat(totals.current.toFixed(2)),
        days30: parseFloat(totals.days30.toFixed(2)),
        days60: parseFloat(totals.days60.toFixed(2)),
        days90Plus: parseFloat(totals.days90Plus.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST record new payment
router.post('/', paymentValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { studentId, type, amount, paymentDate, notes } = req.body;

    // Extract month from payment date (YYYY-MM)
    const monthFor = paymentDate.substring(0, 7);

    const result = await query(`
      INSERT INTO billing (student_id, type, amount, payment_date, month_for, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [studentId, type, amount, paymentDate, monthFor, notes || null]);

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID'
      });
    }
    next(error);
  }
});

// GET payment statistics
router.get('/stats', async (req, res, next) => {
  try {
    const { centerId, month } = req.query;

    let queryText = `
      SELECT
        COUNT(DISTINCT b.student_id) as paying_students,
        COUNT(*) as total_payments,
        COALESCE(SUM(b.amount), 0) as total_collected,
        COALESCE(AVG(b.amount), 0) as avg_payment
      FROM billing b
      JOIN students s ON b.student_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (centerId && centerId !== 'all') {
      paramCount++;
      queryText += ` AND s.center_id = $${paramCount}`;
      params.push(centerId);
    }

    if (month) {
      paramCount++;
      queryText += ` AND b.month_for = $${paramCount}`;
      params.push(month);
    }

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: {
        payingStudents: parseInt(result.rows[0].paying_students),
        totalPayments: parseInt(result.rows[0].total_payments),
        totalCollected: parseFloat(result.rows[0].total_collected),
        avgPayment: parseFloat(result.rows[0].avg_payment)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
