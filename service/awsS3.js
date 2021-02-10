const multer = require('multer');
const upload = multer({storage: multer.memoryStorage()});

const AWS = require('aws-sdk');
const md5 = require('md5');
const awsConfig = require('../awsconfig.json');

const s3 = new AWS.S3({
    accessKeyId:awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
    region: awsConfig.region,
});


exports.upload = async function(req, res) {
    const uploads = upload.single('img');
    if (!req.file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        return new Error('Only image files are allowed!');
    }
    uploads(req, res, async function (err) {
        console.log(req.files);
        const md5FileData = md5(req.file.buffer);
        const [fileName, fileDataType] = req.file.originalname.split('.');
        const params = {
            Bucket: awsConfig.bucket,
            Key: `img/${md5FileData}.${fileDataType}`,
            ACL: 'public-read',
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };
        const tags = {
            tags: [{
                Key: req.file.originalname,
                Value:new Date().getTime(),
            }]
        };
        let imageUri;

        const s3ImgData = await s3.getSignedUrl(
            'getObject',
            {Bucket:awsConfig.bucket, Key: `img/${md5FileData}.${fileDataType}`},
            function (err, data) {
                if (!err) {
                    const [imageData, imageAccessData] = data.split('?')
                    imageUri = imageData;
                }
            })
        if(!s3ImgData){
            const uploadData = await s3.upload(params, tags).promise();
            imageUri = uploadData.Location;
        }

        return imageUri
    })
}
