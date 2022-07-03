const Book = require('../models/book.js');
const Author = require('../models/author.js')
const BookInstance = require('../models/bookinstance.js');
const Genre = require('../models/genre.js');
const mongoose = require('mongoose');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.index = function (req, res) {
   // Get all book information...
   async function book_info() {
      // {} - means all
      const result = {
         book_count: await Book.countDocuments({}),
         book_instance_count: await BookInstance.countDocuments({}),
         book_instance_available_count: await BookInstance.countDocuments({ status: 'Available' }),
         author_count: await Author.countDocuments({}),
         genre_count: await Genre.countDocuments({}),
      }
      return result;
   };

   // Append information in the document...
   book_info().then((result) => {
      res.render('index.pug', { title: 'Local Library Home', data: result });
   }).catch((err) => {
      res.render('error.pug', { error: err });
   })
}

// Display list of all books.
exports.book_list = function (req, res) {
   Book.find({}, 'title author')
      .sort({ title: 1 })
      .populate('author')
      .then((list_books) => {
         res.render('book_list.pug', { title: 'Book List', book_list: list_books });
      })
      .catch((err) => {
         res.render('error.pug', { error: err });
      })
};

// Display detail page for a specific book.
exports.book_detail = async function (req, res) {
   const id = mongoose.Types.ObjectId(req.params.id);
   try {
      const book = await Book.findById(id)
         .populate('author')
         .populate('genre');
      const book_instance = await BookInstance.find({
         'book': req.params.id
      });

      if (book == null)
         throw new Error('Book not found');

      res.render('book_detail.pug', {
         title: book.title,
         book: book,
         book_instances: book_instance,
      })
   } catch (err) {
      res.render('error.pug', { error: err });
   }
}

// Display book create form on GET.
exports.book_create_get = function (req, res) {
   async.parallel({
      authors: function (callback) {
         Author.find(callback);
      },
      genres: function (callback) {
         Genre.find(callback);
      }
   }, function (err, results) {
      if (err)
         return err;

      res.render('book_form.pug', {
         title: 'Create Book',
         authors: results.authors,
         genres: results.genres,
      })
   })
};

// Handle book create on POST.
exports.book_create_post = [
   // Convert genre into an array
   (req, res, next) => {
      if (!(req.body.genre instanceof Array)) {
         if (typeof req.body.genre === 'undefined')
            req.body.genre = []
         else
            req.body.genre = new Array(req.body.genre);
      }
      next();
   },
   // Performing validation
   body('title', 'Title must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape(),
   body('summary', 'Summary must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape(),
   body('isbn', 'ISBN must not be empty')
      .trim()
      .isLength({ min: 1 })
      .escape(),
   body('genre.*').escape(),

   (req, res, next) => {
      const errors = validationResult(req);
      // Input user input fields in the schema
      const book = new Book({
         title: req.body.title,
         author: req.body.author,
         summary: req.body.summary,
         isbn: req.body.isbn,
         genre: req.body.genre
      })
      // if errors exists, then return error message
      if (!errors.isEmpty()) {
         async.parallel({
            authors: function (callback) {
               Author.find(callback);
            },
            genres: function (callback) {
               Genre.find(callback);
            }
         }, function (err, results) {
            if (err)
               return next(err)

            for (let i = 0; i < results.genres.length; i++) {
               if (book.genre.indexOf(results.genres[i]._id) > -1) {
                  results.genres[i].checked = 'true';
               }
            }

            res.render('book_form.pug', {
               title: 'Create Book',
               authors: results.authors,
               gneres: results.genres,
               book: book,
               errors: errors.array()
            })
         });
         return;
      }
      // if there's no error, then show book info document.
      else {
         book.save(function (err) {
            if (err)
               return next(err);

            res.redirect(book.url);
         })
      }
   }
]

// Display book delete form on GET.
exports.book_delete_get = function (req, res, next) {
};

// Handle book delete on POST.
exports.book_delete_post = function (req, res) {
   res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function (req, res, next) {
   async.parallel({
      book: function (callback) {
         Book.findById(req.params.id)
            .populate('author')
            .populate('genre')
            .exec(callback);
      },

      authors: function (callback) {
         Author.find(callback);
      },

      genres: function (callback) {
         Genre.find(callback);
      },
   }, function (err, results) {
      if (err)
         return next(err);
      if (results.book == null) {
         const err = new Error('Book not found');
         err.status = 404;
         return next(err);
      }

      for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
         for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
            if (results.genres[all_g_iter]._id.toString() === results.book.genre[book_g_iter]._id.toString()) {
               results.genres[all_g_iter].checked = 'true';
            }
         }
      }

      res.render('book_form.pug', {
         title: 'Update Book',
         authors: results.authors,
         genres: results.genres,
         book: results.book,
      })
   })
}

// Handle book update on POST.
exports.book_update_post = [
   (req, res, next) => {
      if (!(req.body.genre instanceof Array)) {
         if (typeof req.body.genre === 'undefined')
            req.body.genre = [];
         else
            req.body.genre = new Array(req.body.genre);
      }
      next();
   },

   // Validate and sanitize fields
   body('title', 'Title must not be empty')
      .trim()
      .isLength({ min: 1 })
      .escape(),
   body('author', 'Author must not be empty')
      .trim()
      .isLength({ min: 1 })
      .escape(),
   body('isbn', 'ISBN must not be empty')
      .trim()
      .isLength({ min: 1 })
      .escape(),
   body('genre.*')
      .escape(),

   (req, res, next) => {
      const errors = validationResult(req);

      const book = new Book({
         title: req.body.title,
         author: req.body.author,
         summary: req.body.summary,
         isbn: req.body.isbn,
         genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
         _id: req.params.id
      })

      if (!errors.isEmpty()) {
         async.parallel({
            authors: function (callback) {
               Author.find(callback);
            },
            genres: function (callback) {
               Genre.find(callback)
            },
         }, function (err, results) {
            if (err)
               return next(err);

            for (let i = 0; i < results.genres.length; i++) {
               if (err)
                  return next(err);
               for (let i = 0; i < results.genres.length; i++) {
                  if (book.genre.indexOf(results.genres[i]._id) > -1) {
                     results.genres[i].checked = 'true';
                  }
               }
            }
            res.render('book_form.pug', {
               title: 'Update Book',
               authors: results.authors,
               genres: results.genres,
               book: book,
               errors: errors.array()
            })
            return;
         });
      }
      else {
         Book.findByIdAndUpdate(
            req.params.id,
            book,
            {},
            function (err, theBook) {
               if (err)
                  return next(err)
               res.redirect(theBook.url);
            }
         )
      }
   }
]