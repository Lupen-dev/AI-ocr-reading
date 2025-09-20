const router = require('express').Router();
const Document = require('../models/document.model');
const multer = require('multer');
const filestack = require('filestack-js');
const client = filestack.init(process.env.FILESTACK_API_KEY);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route('/upload').post(upload.single('file'), (req, res) => {
    const { file } = req;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    client.upload(file.buffer)
        .then(fsRes => {
            const fileUrl = fsRes.url;
            const ocrUrl = `https://process.filestackapi.com/ocr/${fsRes.handle}`;
            
            // You would typically fetch the ocrUrl content here to get the text
            // For simplicity, we'll just save the URL and a placeholder text
            
            const newDocument = new Document({
                filename: file.originalname,
                filepath: fileUrl,
                filetype: file.mimetype,
                filesize: file.size,
                ocrText: "OCR text will be processed here.", // Placeholder
            });

            newDocument.save()
                .then(doc => res.json(doc))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Filestack upload failed.');
        });
});

router.route('/').get((req, res) => {
    Document.find()
        .then(documents => res.json(documents))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/search').get((req, res) => {
    const { term } = req.query;
    Document.find({ ocrText: { $regex: term, $options: 'i' } })
        .then(documents => res.json(documents))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
    Document.findById(req.params.id)
        .then(document => res.json(document))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').put((req, res) => {
    Document.findById(req.params.id)
        .then(document => {
            document.notes = req.body.notes;
            document.physicalLocation = req.body.physicalLocation;

            document.save()
                .then(() => res.json('Document updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;
