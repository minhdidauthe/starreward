const { DailyTask } = require('../models/Basic');

const initDefaultTasks = async () => {
    try {
        const count = await DailyTask.countDocuments();
        if (count === 0) {
            const defaultTasks = [
                { name: 'Rửa bát', stars: 2, description: 'Rửa bát sau bữa ăn' },
                { name: 'Học bài', stars: 3, description: 'Hoàn thành bài tập về nhà' },
                { name: 'Ngủ đúng giờ', stars: 2, description: 'Đi ngủ trước 10 giờ tối' },
                { name: 'Ăn đúng giờ', stars: 2, description: 'Ăn đúng bữa, đúng giờ' },
                { name: 'Dọn phòng', stars: 2, description: 'Dọn dẹp phòng ngủ gọn gàng' },
                { name: 'Đánh răng', stars: 1, description: 'Đánh răng sáng và tối' },
                { name: 'Tập thể dục', stars: 2, description: 'Tập thể dục buổi sáng' },
            ];

            for (const task of defaultTasks) {
                await DailyTask.create({
                    name: task.name,
                    default_stars: task.stars,
                    description: task.description
                });
            }
            console.log('--- Default tasks seeded ---');
        }
    } catch (err) {
        console.error('Error seeding tasks:', err);
    }
};

module.exports = initDefaultTasks;
