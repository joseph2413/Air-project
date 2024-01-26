const router = require("express").Router();
const sessionRouter = require("./session.js");
const usersRouter = require("./users.js");
const spotsRouter = require("./spots.js");
// const spotImagesRouter = require("./spot-images");
const reviewsRouter = require("./review.js");
// const reviewImagesRouter = require("./review-images");
const { restoreUser } = require("../../utils/auth.js");

// Connect restoreUser middleware to the API router
// If current user session is valid, set req.user to the user in the database
// If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use("/session", sessionRouter);

router.use("/users", usersRouter);

router.use("/spots", spotsRouter);

// router.use("/spot-images", spotImagesRouter);

router.use("/reviews", reviewsRouter);

// router.use("/review-images", reviewImagesRouter);



module.exports = router;


// const { setTokenCookie } = require('../../utils/auth.js');
// const { User } = require('../../db/models');
// router.get('/set-token-cookie', async (_req, res) => {
//   const user = await User.findOne({
//     where: {
//       username: 'DemoU'
//     }
//   });
//   setTokenCookie(res, user);
//   return res.json({ user: user });
// });
// const { restoreUser } = require('../../utils/auth.js');

// router.use(restoreUser);

// router.get(
//   '/restore-user',
//   (req, res) => {
//     return res.json(req.user);
//   }
// );

// const { requireAuth } = require('../../utils/auth.js');
// router.get(
//   '/require-auth',
//   requireAuth,
//   (req, res) => {
//     return res.json(req.user);
//   }
// );
