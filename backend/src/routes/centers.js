const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET all centers
router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM centers ORDER BY name');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET single center by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM centers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Center not found'
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

// GET center statistics
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get center details
    const centerResult = await query(
      'SELECT * FROM centers WHERE id = $1',
      [id]
    );

    if (centerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Center not found'
      });
    }

    const center = centerResult.rows[0];

    // Get student count
    const studentResult = await query(
      'SELECT COUNT(*) as count FROM students WHERE center_id = $1 AND status = $2',
      [id, 'active']
    );

    const enrollment = parseInt(studentResult.rows[0].count);
    const capacityPercent = (enrollment / center.capacity) * 100;

    // Get AR statistics (simplified - would need more complex calculation in production)
    const arResult = await query(`
      SELECT
        COALESCE(SUM(s.tuition * 3), 0) as expected_revenue,
        COALESCE(SUM(b.amount), 0) as total_paid
      FROM students s
      LEFT JOIN billing b ON s.id = b.student_id
      WHERE s.center_id = $1 AND s.status = 'active'
    `, [id]);

    const expectedRevenue = parseFloat(arResult.rows[0].expected_revenue);
    const totalPaid = parseFloat(arResult.rows[0].total_paid);
    const arOutstanding = Math.max(0, expectedRevenue - totalPaid);
    const arPercent = expectedRevenue > 0 ? (arOutstanding / expectedRevenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        ...center,
        enrollment,
        capacityPercent: parseFloat(capacityPercent.toFixed(2)),
        arOutstanding: parseFloat(arOutstanding.toFixed(2)),
        arPercent: parseFloat(arPercent.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
