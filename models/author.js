const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const { Schema } = mongoose;

const AuthorSchema = Schema({
   first_name: {
      type: String,
      required: true,
      maxLength: 100
   },
   family_name: {
      type: String,
      required: true,
      maxLength: 100
   },
   date_of_birth: { type: Date },
   date_of_death: { type: Date },
});

// Virtual for author "full" name.
AuthorSchema.virtual('name').get(function () {
   if (this.family_name && this.first_name)
      return this.family_name + ', ' + this.first_name;
   else
      return 'No Author Name';
});

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function () {
   let lifetime_string = '';
   if (!this.date_of_birth)
      return lifetime_string += ' Unknown ';

   lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
   if (!this.date_of_death)
      return lifetime_string += ' - Present';

   lifetime_string += ' - ';
   lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);

   return lifetime_string;
});

// Virtual for author's URL
AuthorSchema.virtual('url').get(function () {
   return '/catalog/author/' + this._id;
});

//Export model
module.exports = mongoose.model('Author', AuthorSchema);