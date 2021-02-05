const express = require('express');
const router = express.Router();
const { upload } = require('../service/awsS3');


router.post('/uploadOne', async (req, res, next) => {
  try {
    const imageUri = await upload(req);
    return res.json({status: 'success', data: imageUri})
  }catch (e) {
    console.error(e);
  }
});


module.exports = router;
