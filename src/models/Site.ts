import mongoose, { Schema } from 'mongoose';

export const SiteSchema = new Schema({
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    state: {
        type: String,
        required: [true, 'State is required']
    },
    zip: {
        type: String,
        required: [true, 'Zip code is required']
    },
    country: {
        type: String,
        required: [true, 'Country is required']
    }
}, {
    timestamps: true
});

const Site = mongoose.models.Site || mongoose.model('Site', SiteSchema);

export default Site;