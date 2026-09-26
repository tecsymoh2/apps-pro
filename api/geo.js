// Returns the visitor's country code (used for download analytics). Works on Vercel.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.status(200).json({ country: req.headers['x-vercel-ip-country'] || '' });
};
