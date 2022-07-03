const Book = require('../models/book.js')
const BookInstance = require('../models/bookinstance.js');
const { body, validationResult } = require('express-validator');
const { render } = require('pug');

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res) {
   BookInstance.find({}).populate('book')
      .then((list_bookinstances) => {
         res.render('bookinstance_list', {
            title: 'Book Instance List',
            bookinstance_list: list_bookinstances,
         });
      })
      .catch((err) => {
         res.render('error.pug', { error: err });
      })
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = async function (req, res) {
   try {
      const book_instance_detail = await BookInstance
         .findById(req.params.id)
         .populate('book');

      if (book_instance_detail == null)
         throw new Error('Book copy not found');

      res.render('bookinstance_detail.pug', {
         title: 'Copy' + book_instance_detail.book.title,
         bookinstance: book_instance_detail,
      })
   } catch (err) {
      res.render('error.pug', { error: err });
   }
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res) {
   Book.find({}, 'title').exec(function (err, books) {
      if (err)
         return next(err)

      res.render('bookinstance_form.pug', {
         title: 'Create BookInstance',
         book_list: books
      })
   })
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
   body('book', 'Book must be specified')
      .trim()
      .isLength({ min: 1 })
      .escape(),
   body('imprint', 'Imprint must be speicified')
      .trim()
      .isLength({ min: 1 })
      .escape(),
   body('status')
      .escape(),
   body('due_back', 'Invalid Date')
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(),

   (req, res, next) => {
      const errors = validationResult(req);
      const bookinstance = new BookInstance({
         book: req.body.book,
         imprint: req.body.imprint,
         status: req.body.status,
         due_back: req.body.due_back,
      })

      if (!errors.isEmpty()) {
         Book.find({}, 'title')
            .exec(function (err, books) {
               if (err)
                  return next(err);
            })
         // Re-render the page if there's an error
         res.render('bookinstance_form', {
            title: 'Create BookInstance',
            book_list: books,
            selected_book: bookinstance.book._id,
            errors: errors.array(),
            bookinsntance: bookinstance
         })
         return;
      }
      else {
         bookinstance.save(function (err) {
            if (err) { return next(err) }
            res.redirect(bookinstance.url);
         })
      }
   }
]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res) {
   res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res) {
   res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res) {
   res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function (req, res) {
   res.send('NOT IMPLEMENTED: BookInstance update POST');
};