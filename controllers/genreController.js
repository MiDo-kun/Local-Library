const mongoose = require('mongoose');
const Genre = require('../models/genre.js');
const Book = require('../models/book.js');
const { body, validationResult } = require('express-validator');

// Display list of all Genre.
exports.genre_list = function (req, res) {
   Genre.find({}).sort([['name', 'ascending']])
      .then(result => {
         res.render('genre_list.pug', {
            title: 'Genre List',
            genre_list: result
         });
      })
      .catch(err => {
         res.render('error.pug', { error: err });
      })
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res) {
   async function genre_detail() {
      const id = mongoose.Types.ObjectId(req.params.id);
      const genreDetails = {
         genre: await Genre.findById(id),
         genre_books: await Book.find({ 'genre': id }),
      }
      return genreDetails;
   }

   genre_detail()
      .then((results) => {
         if (results == null) {
            const err = new Error('Genre not found');
            err.status = 404;
            throw err;
         }

         res.render('genre_detail.pug', {
            title: 'Genre Detail',
            genre: results.genre,
            genre_books: results.genre_books,
         })
      })
      .catch((err) => {
         res.render('error.pug', { error: err });
      });
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res, next) {
   res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
   body('name', 'Genre name must contain at least 3 characters')
      .trim()
      .isLength({ min: 3 })
      .escape(),
   function (req, res, next) {
      const errors = validationResult(req);
      const genre = new Genre({ name: req.body.name });

      if (!errors.isEmpty()) {
         res.render('genre_form', {
            title: 'Create Genre',
            genre: genre,
            errors: errors.array()
         });
         return;
      }
      else {
         Genre.findOne({ 'name': req.body.name })
            .exec(function (err, found_genre) {
               if (err) {
                  return next(err);
               }
               if (found_genre) {
                  res.redirect(found_genre.url);
               }
               else {
                  genre.save(function (err) {
                     if (err) {
                        return next(err);
                     }
                     res.redirect(genre.url);
                  });
               }
            });
      }
   }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res) {
   res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res) {
   res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
   res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function (req, res) {
   res.send('NOT IMPLEMENTED: Genre update POST');
};