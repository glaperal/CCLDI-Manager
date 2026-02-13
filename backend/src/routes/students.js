const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');

// Validation middleware
const studentValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('age').isInt({ min: 1, max: 18 }).withMessage('Age must be between 1 and 18'),
  body('gender').isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),
  body('parent').trim().notEmpty().withMessage('Parent/Guardian name is required'),
  body('contact').trim().notEmpty().withMessage('Contact number is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('centerId').trim().notEmpty().withMessage('Center is required'),
  body('tuition').isFloat({ min: 0 }).withMessage('Tuition must be a positive number')
];

// GET all students with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { centerId, status = 'active', search } = req.query;

    let queryText = `
      SELECT s.*, c.name as center_name
      FROM students s
      LEFT JOIN centers c ON s.center_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (centerId && centerId !== 'all') {
      paramCount++;
      queryText += ` AND s.center_id = $${paramCount}`;
      params.push(centerId);
    }

    if (status) {
      paramCount++;
      queryText += ` AND s.status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      queryText += ` AND (
        LOWER(s.first_name || ' ' || s.last_name) LIKE LOWER($${paramCount})
        OR LOWER(s.parent) LIKE LOWER($${paramCount})
        OR s.contact LIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    queryText += ' ORDER BY s.last_name, s.first_name';

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

// GET single student by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT s.*, c.name as center_name
      FROM students s
      LEFT JOIN centers c ON s.center_id = c.id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// GET student AR (Accounts Receivable) details
router.get('/:id/ar', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get student info
    const studentResult = await query(
      'SELECT * FROM students WHERE id = $1',
      [id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const student = studentResult.rows[0];

    // Calculate expected payments
    const enrollmentDate = new Date(student.enrollment_date);
    const currentDate = new Date();
    const monthsSinceEnrollment = Math.floor(
      (currentDate - enrollmentDate) / (1000 * 60 * 60 * 24 * 30)
    );
    const expectedPayments = monthsSinceEnrollment + 1;
    const expectedTotal = student.tuition * expectedPayments;

    // Get total paid
    const paymentsResult = await query(
      'SELECT COALESCE(SUM(amount), 0) as total_paid FROM billing WHERE student_id = $1',
      [id]
    );

    const totalPaid = parseFloat(paymentsResult.rows[0].total_paid);
    const outstanding = Math.max(0, expectedTotal - totalPaid);
    const monthsUnpaid = student.tuition > 0 ? Math.floor(outstanding / student.tuition) : 0;

    res.json({
      success: true,
      data: {
        studentId: student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        tuition: parseFloat(student.tuition),
        monthsSinceEnrollment,
        expectedPayments,
        expectedTotal: parseFloat(expectedTotal.toFixed(2)),
        totalPaid: parseFloat(totalPaid.toFixed(2)),
        outstanding: parseFloat(outstanding.toFixed(2)),
        monthsUnpaid
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST create new student
router.post('/', studentValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      age,
      gender,
      parent,
      contact,
      email,
      centerId,
      tuition
    } = req.body;

    const result = await query(`
      INSERT INTO students (
        first_name, last_name, age, gender, parent, contact, email, center_id, tuition
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [firstName, lastName, age, gender, parent, contact, email || null, centerId, tuition]);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        error: 'Invalid center ID'
      });
    }
    next(error);
  }
});

// PUT update student
router.put('/:id', studentValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      firstName,
      lastName,
      age,
      gender,
      parent,
      contact,
      email,
      centerId,
      tuition
    } = req.body;

    const result = await query(`
      UPDATE students SET
        first_name = $1,
        last_name = $2,
        age = $3,
        gender = $4,
        parent = $5,
        contact = $6,
        email = $7,
        center_id = $8,
        tuition = $9
      WHERE id = $10
      RETURNING *
    `, [firstName, lastName, age, gender, parent, contact, email || null, centerId, tuition, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        error: 'Invalid center ID'
      });
    }
    next(error);
  }
});

// DELETE student (soft delete - sets status to inactive)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      "UPDATE students SET status = 'inactive' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
