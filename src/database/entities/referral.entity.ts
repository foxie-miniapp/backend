import * as mongoose from 'mongoose';

//Referral Interface
interface IReferral extends mongoose.Document {
  referrer: mongoose.Types.ObjectId;
  referred: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new mongoose.Schema<IReferral>(
  {
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);

export default Referral;
