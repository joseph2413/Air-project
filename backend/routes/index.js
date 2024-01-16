const express = require('express');
const router = express.Router();
//TEST ROUTE:
// router.get('/hello/world', function(req, res) {
//   res.cookie('XSRF-TOKEN', req.csrfToken());
//   res.send('Hello World!');
// });


router.get('/api/crsf/restore', (req, res) =>{
    const csrfToken = req.csrfToken();
    res.cookie('XRSF-TOKEN', csrfToken);
    res.status(200).json({
        'XSRF-TOKEN': csrfToken
    });
});

module.exports = router;
