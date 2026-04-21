const express = require('express')
const router = express.Router()
const Notice = require('../models/Notice')
const { authenticate, authorize, optionalAuth } = require('../middleware/auth')

// GET /api/notices - Public: anyone can view active notices
router.get('/', optionalAuth, async (req, res) => {
  try {
    const filter = { isActive: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }

    const { category, priority } = req.query
    if (category) filter.category = category
    if (priority) filter.priority = priority

    const notices = await Notice.find(filter)
      .populate('createdBy', 'name role')
      .sort({ priority: -1, createdAt: -1 })

    res.json({ success: true, data: notices })
  } catch (error) {
    console.error('GET /notices error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// GET /api/notices/all - Admin only: see all including inactive/expired
router.get('/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })

    res.json({ success: true, data: notices })
  } catch (error) {
    console.error('GET /notices/all error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/notices - Admin or Organizer
router.post('/', authenticate, authorize('admin', 'organizer'), async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: 'Request body is empty or not JSON' })
    }

    const { title, content, category, priority, expiresAt } = req.body

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' })
    }

    const notice = await Notice.create({
      title: title.trim(),
      content: content.trim(),
      category: category || 'general',
      priority: priority || 'medium',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id,
    })

    const populated = await Notice.findById(notice._id).populate('createdBy', 'name role')

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Notice created successfully',
    })
  } catch (error) {
    console.error('POST /notices error:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
})

// PUT /api/notices/:id - Admin or notice creator (organizer)
router.put('/:id', authenticate, authorize('admin', 'organizer'), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' })

    if (
      req.user.role === 'organizer' &&
      notice.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this notice' })
    }

    const { title, content, category, priority, isActive, expiresAt } = req.body

    const updated = await Notice.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        category,
        priority,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name role')

    res.json({ success: true, data: updated, message: 'Notice updated' })
  } catch (error) {
    console.error('PUT /notices error:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE /api/notices/:id - Admin only
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id)
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' })

    res.json({ success: true, message: 'Notice deleted' })
  } catch (error) {
    console.error('DELETE /notices error:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router