const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const Gallery  = require('../models/Gallery');
const imagekit = require('../config/imagekit');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

// Multer — memoryStorage
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type. Only JPEG, PNG, WebP and GIF allowed.'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ message: 'File too large. Max 10 MB allowed.' });
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// ── GET /api/gallery/events  — one card per event (grouped) ──────────────────
router.get('/events', optionalAuth, async (req, res) => {
  try {
    const groups = await Gallery.aggregate([
      { $match: { event: { $ne: null } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$event',
          photoCount: { $sum: 1 },
          cover:      { $first: '$thumbnailUrl' },
          coverFull:  { $first: '$imageUrl' },
          latestAt:   { $max: '$createdAt' },
        },
      },
      { $sort: { latestAt: -1 } },
      {
        $lookup: {
          from:         'events',
          localField:   '_id',
          foreignField: '_id',
          as:           'eventData',
        },
      },
      { $unwind: '$eventData' },
      {
        $project: {
          _id:           1,
          photoCount:    1,
          cover:         { $ifNull: ['$cover', '$coverFull'] },
          latestAt:      1,
          eventTitle:    '$eventData.title',
          eventDate:     '$eventData.date',
          eventCategory: '$eventData.category',
        },
      },
    ]);
    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('GET /gallery/events error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/gallery/events/:eventId  — all photos for one event ──────────────
router.get('/events/:eventId', optionalAuth, async (req, res) => {
  try {
    const photos = await Gallery.find({ event: req.params.eventId })
      .populate('uploader', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: photos });
  } catch (error) {
    console.error('GET /gallery/events/:eventId error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/gallery  (Public — guests can view) ──────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip  = (page - 1) * limit;

    let query = {};
    if (req.query.search) query.$text = { $search: req.query.search };

    const [images, total] = await Promise.all([
      Gallery.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('uploader', 'name role')
        .lean(),
      Gallery.countDocuments(query),
    ]);

    res.json({
      images,
      pagination: { page, pages: Math.ceil(total / limit), total },
    });
  } catch (error) {
    console.error('Gallery GET error:', error);
    res.status(500).json({ message: 'Server error fetching gallery' });
  }
});

// ── POST /api/gallery  (student / organizer / admin only) ─────────────────────
router.post(
  '/',
  authenticate,
  authorize('student', 'organizer', 'admin'),
  upload.single('image'),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: 'Please select an image to upload' });

      const { title, description = '', tags = '', eventId = null } = req.body;
// title is optional — fallback to 'Untitled' if not provided

      const fileName = `gallery_${req.user._id}_${Date.now()}_${req.file.originalname}`;
      const uploadResponse = await imagekit.upload({
        file:              req.file.buffer,
        fileName:          fileName,
        folder:            '/campussync/gallery',
        useUniqueFileName: true,
        tags:              tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });

      const thumbnailUrl = imagekit.url({
        src: uploadResponse.url,
        transformation: [{ height: 400, width: 400, cropMode: 'extract', focus: 'auto' }],
      });

      const parsedTags = tags
        ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        : [];

      const image = await Gallery.create({
      title:        title?.trim() || 'Untitled',   // ← fallback
      description:  description.trim(),
      imageUrl:     uploadResponse.url,
      imageFileId:  uploadResponse.fileId,
      thumbnailUrl,
      uploader:     req.user._id,
      uploaderName: req.user.name,
      uploaderRole: req.user.role,
      tags:         parsedTags,
      event:        eventId || null,               // ← save event link
});

      await image.populate('uploader', 'name role');
      res.status(201).json({ message: 'Image uploaded successfully', image });
    } catch (error) {
      console.error('Gallery POST error:', error);
      res.status(500).json({ message: 'Server error uploading image' });
    }
  }
);

// ── DELETE /api/gallery/:id  (owner OR admin only) ───────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    const isOwner = image.uploader.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: 'Not authorized to delete this image' });

    try { await imagekit.deleteFile(image.imageFileId); }
    catch (ikErr) { console.error('ImageKit delete error:', ikErr.message); }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Gallery DELETE error:', error);
    res.status(500).json({ message: 'Server error deleting image' });
  }
});

// ── POST /api/gallery/:id/like  (authenticated, toggles like) ────────────────
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    const userId    = req.user._id.toString();
    const likeIndex = image.likes.findIndex(id => id.toString() === userId);
    let liked;

    if (likeIndex === -1) {
      image.likes.push(req.user._id);
      liked = true;
    } else {
      image.likes.splice(likeIndex, 1);
      liked = false;
    }
    image.likeCount = image.likes.length;
    await image.save();

    res.json({ liked, likeCount: image.likeCount });
  } catch (error) {
    console.error('Gallery like error:', error);
    res.status(500).json({ message: 'Server error toggling like' });
  }
});

module.exports = router;