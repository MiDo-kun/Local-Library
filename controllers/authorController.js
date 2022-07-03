const mongoose = require('mongoose');
const Author = require('../models/author.js');
const Book = require('../models/book.js');
const async = require('async');
const { body, validationResult } = require('express-validator');

// Display list of all Authors.
exports.author_list = function (req, res, next) {
   Author.find()
      .sort([['family_name', 'ascending']])
      .exec(function (err, list_authors) {
         if (err) {
            return next(err);
         }
         res.render('author_list.pug', { title: 'Author List', author_list: list_authors });
      });
};;

// Display detail page for a specific Author.
exports.author_detail = async function (req, res) {
   const id = mongoose.Types.ObjectId(req.params.id);
   try {
      const author = await Author.findById(id);
      const authors_books = await Book.find({
         'author': id
      }, 'title summary')

      if (author == null)
         throw new Error('Author not found');

      res.render('author_detail.pug', {
         title: 'Author Detail',
         author: author,
         author_books: authors_books
      });

   } catch (err) {
      res.render('error.pug', { error: err });
   }
};

// Display Author create form on GET.
exports.author_create_get = function (req, res) {
   res.render('author_form.pug', { title: 'Create Author' });
};

// Handle Author create on POST. 
exports.author_create_post = [
   body('first_name')
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage('First name must be specified.')
      .isAlphanumeric()
      .withMessage('First name has non-alphanumeric characters.'),
   body('family_name')
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage('Family name must be specified.')
      .isAlphanumeric()
      .withMessage('Family name has non-alphanumeric characters.'),
   body('date_of_birth', 'Invalid date of birth')
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(),
   body('date_of_death', 'Invalid date of death')
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(),

   (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
         res.render('author_form', {
            title: 'Create Author',
            author: req.body,
            errors: errors.array(),
         })
         return;
      } else {
         const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
         });

         author.save(function (err) {
            if (err)
               return next(err);

            res.redirect(author.url);
         })
      }
   }
]
// Display Author delete form on GET.      
exports.author_delete_get = function (req, res) {
   async.parallel({
      author: function (callback) {
         Author.findById(req.params.id).exec(callback)
      },
      authors_books: function (callback) {
         Book.find({ 'author': req.params.id }).exec(callback);
      }
   }, function (err, results) {
      if (err)
         return next(err)
      if (results.author == null)
         res.redirect('/catalog/authors')

      res.render('author_delete', {
         title: 'Delete Author',
         author: results.author,
         author_books: results.authors_books,
      })
   })
};

// Handle Author delete on POST.
exports.author_delete_post = function (req, res) {
   async.parallel({
      author: function (callback) {
         Author.findById(req.body.authorid).exec(callback);
      },
      authors_books: function (callback) {
         Book.find({ 'author': req.body.authorid }).exec(callback)
      },
   }, function (err, results) {
      if (err)
         return next(err)
      if (results.authors_books.length > 0) {
         res.render('author_delete.pug', {
            title: 'Delete Author',
            author: results.author,
            author_books: results.authors_books,
         })
         return;
      } else {
         Author.findByIdAndRemove(req.body.authorid,
            function deleteAuthor(err) {
               if (err)
                  return next(err)
               res.redirect('/catalog/authors');
            });
      }
   })
};

// Display Author update form on GET.
exports.author_update_get = function (req, res) {
   res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function (req, res) {
   res.send('NOT IMPLEMENTED: Author update POST');
};