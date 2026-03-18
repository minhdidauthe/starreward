const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    type: {
        type: String,
        enum: ['star_earned', 'star_lost', 'task_completed', 'achievement', 'checkin', 'shop_purchase', 'system'],
        required: true
    },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 500 },
    icon: { type: String, default: 'fa-bell' },
    color: { type: String, default: 'primary' },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ student: 1, isRead: 1, createdAt: -1 });

// Static helper to create + return notification
notificationSchema.statics.notify = async function(studentId, type, title, message, options = {}) {
    return this.create({
        student: studentId,
        type,
        title,
        message,
        icon: options.icon || getIconForType(type),
        color: options.color || getColorForType(type),
        link: options.link || null
    });
};

function getIconForType(type) {
    const map = {
        star_earned: 'fa-star',
        star_lost: 'fa-star-half-alt',
        task_completed: 'fa-check-circle',
        achievement: 'fa-trophy',
        checkin: 'fa-calendar-check',
        shop_purchase: 'fa-shopping-cart',
        system: 'fa-bell'
    };
    return map[type] || 'fa-bell';
}

function getColorForType(type) {
    const map = {
        star_earned: 'warning',
        star_lost: 'danger',
        task_completed: 'success',
        achievement: 'info',
        checkin: 'primary',
        shop_purchase: 'purple',
        system: 'secondary'
    };
    return map[type] || 'primary';
}

module.exports = mongoose.model('Notification', notificationSchema);
