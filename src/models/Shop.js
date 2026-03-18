const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 300 },
    icon: { type: String, required: true },
    image: { type: String },
    cost: { type: Number, required: true, min: 1 },
    category: {
        type: String,
        enum: ['privilege', 'avatar', 'theme', 'physical', 'experience'],
        default: 'privilege'
    },
    stock: { type: Number, default: -1 },  // -1 = unlimited
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
});

const purchaseSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopItem', required: true },
    itemName: { type: String, required: true },
    cost: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'delivered', 'cancelled'],
        default: 'pending'
    },
    purchasedAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date }
});

purchaseSchema.index({ student: 1, purchasedAt: -1 });

const categoryLabels = {
    privilege: 'Đặc quyền',
    avatar: 'Avatar',
    theme: 'Giao diện',
    physical: 'Phần thưởng vật lý',
    experience: 'Trải nghiệm'
};

const categoryIcons = {
    privilege: 'fa-crown',
    avatar: 'fa-user-astronaut',
    theme: 'fa-palette',
    physical: 'fa-gift',
    experience: 'fa-magic'
};

module.exports = {
    ShopItem: mongoose.model('ShopItem', shopItemSchema),
    Purchase: mongoose.model('Purchase', purchaseSchema),
    categoryLabels,
    categoryIcons
};
