const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET all settings
router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM settings ORDER BY key');

    // Convert to key-value object
    const settings = result.rows.reduce((acc, row) => {
      acc[row.key] = {
        value: row.value,
        description: row.description,
        updatedAt: row.updated_at
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

// GET single setting by key
router.get('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const result = await query('SELECT * FROM settings WHERE key = $1', [key]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
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

// PUT update setting
router.put('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        error: 'Value is required'
      });
    }

    const result = await query(
      'UPDATE settings SET value = $1 WHERE key = $2 RETURNING *',
      [value.toString(), key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }

    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
