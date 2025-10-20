import mongoose, { Schema, models } from 'mongoose';

const CompanySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Company = models.Company || mongoose.model('Company', CompanySchema);

export default Company;
