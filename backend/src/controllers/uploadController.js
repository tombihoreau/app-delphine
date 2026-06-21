const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uploadRoot = path.join(__dirname, '../../uploads/programs');

const ensureUploadDir = () => {
  fs.mkdirSync(uploadRoot, { recursive: true });
};

const uploadProgramImage = (req, res) => {
  const { data_url } = req.body;

  if (!data_url || typeof data_url !== 'string') {
    return res.status(400).json({ error: 'Image requise' });
  }

  const match = data_url.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    return res.status(400).json({ error: 'Format image invalide' });
  }

  const mimeType = match[1];
  const extension = mimeType === 'image/png'
    ? 'png'
    : mimeType === 'image/webp'
      ? 'webp'
      : 'jpg';
  const buffer = Buffer.from(match[2], 'base64');
  const maxSize = 5 * 1024 * 1024;

  if (buffer.length > maxSize) {
    return res.status(400).json({ error: 'Image trop lourde, maximum 5 Mo' });
  }

  try {
    ensureUploadDir();

    const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const filePath = path.join(uploadRoot, filename);
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/programs/${filename}`;
    res.status(201).json({ url: imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Impossible d'enregistrer l'image" });
  }
};

const deleteProgramImageFile = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return;

  try {
    const parsedUrl = new URL(imageUrl);
    const uploadPrefix = '/uploads/programs/';
    if (!parsedUrl.pathname.startsWith(uploadPrefix)) return;

    const filename = path.basename(parsedUrl.pathname);
    const filePath = path.join(uploadRoot, filename);
    if (!filePath.startsWith(uploadRoot)) return;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    if (!imageUrl.startsWith('/uploads/programs/')) return;
    const filename = path.basename(imageUrl);
    const filePath = path.join(uploadRoot, filename);
    if (filePath.startsWith(uploadRoot) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

module.exports = { uploadProgramImage, deleteProgramImageFile };
