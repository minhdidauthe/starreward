const { DailyTask } = require('../models/Basic');
const { Subject, Chapter, Lesson } = require('../models/Learning');
const { Exam, Question } = require('../models/Exam');
const { ExploreCategory, ExploreActivity } = require('../models/Explore');
const User = require('../models/User');

// ============================================
// Seed Default Daily Tasks
// ============================================
const seedDailyTasks = async () => {
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
        console.log('✓ Default daily tasks seeded');
    }
};

// ============================================
// Seed Learning Data (Subjects, Chapters, Lessons)
// ============================================
const seedLearningData = async () => {
    const count = await Subject.countDocuments();
    if (count === 0) {
        // Create Subjects
        const mathSubject = await Subject.create({
            name: 'Toán Học',
            description: 'Các bài học về số học, hình học và tư duy logic',
            icon: 'fa-calculator'
        });

        const englishSubject = await Subject.create({
            name: 'Tiếng Anh',
            description: 'Từ vựng, ngữ pháp và luyện nghe nói',
            icon: 'fa-language'
        });

        const vietnameseSubject = await Subject.create({
            name: 'Tiếng Việt',
            description: 'Tập đọc, chính tả và tập làm văn',
            icon: 'fa-book-open'
        });

        // Create Chapters and Lessons for Math
        const mathChapter1 = await Chapter.create({
            subject: mathSubject._id,
            title: 'Chương 1: Số và Phép tính',
            order: 1
        });

        await Lesson.create([
            {
                chapter: mathChapter1._id,
                title: 'Bài 1: Đếm số từ 1 đến 10',
                content: `
# Đếm số từ 1 đến 10

## Mục tiêu bài học
- Nhận biết các số từ 1 đến 10
- Biết đếm xuôi và đếm ngược

## Nội dung

### Các số từ 1 đến 10:
1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟

### Bài tập thực hành:
1. Hãy đếm số ngón tay của mình
2. Đếm số bút chì trong hộp
3. Đếm ngược từ 10 về 1

**Chúc con học tốt!** ⭐
                `,
                video_url: ''
            },
            {
                chapter: mathChapter1._id,
                title: 'Bài 2: Phép cộng trong phạm vi 10',
                content: `
# Phép cộng trong phạm vi 10

## Mục tiêu bài học
- Hiểu khái niệm phép cộng
- Thực hiện phép cộng đơn giản

## Nội dung

### Phép cộng là gì?
Phép cộng là gộp các số lại với nhau.

**Ví dụ:** 2 + 3 = 5 (Hai quả táo cộng ba quả táo bằng năm quả táo)

### Bảng cộng:
- 1 + 1 = 2
- 2 + 2 = 4
- 3 + 3 = 6
- 4 + 4 = 8
- 5 + 5 = 10

### Bài tập:
1. 1 + 2 = ?
2. 3 + 4 = ?
3. 5 + 3 = ?

**Luyện tập nhiều nhé!** 🌟
                `,
                video_url: ''
            },
            {
                chapter: mathChapter1._id,
                title: 'Bài 3: Phép trừ trong phạm vi 10',
                content: `
# Phép trừ trong phạm vi 10

## Mục tiêu bài học
- Hiểu khái niệm phép trừ
- Thực hiện phép trừ đơn giản

## Nội dung

### Phép trừ là gì?
Phép trừ là bớt đi một số lượng.

**Ví dụ:** 5 - 2 = 3 (Năm quả táo bớt đi hai quả còn ba quả)

### Bảng trừ:
- 10 - 5 = 5
- 8 - 4 = 4
- 6 - 3 = 3
- 4 - 2 = 2

### Bài tập:
1. 5 - 2 = ?
2. 7 - 3 = ?
3. 9 - 4 = ?

**Cố gắng lên nào!** 💪
                `,
                video_url: ''
            }
        ]);

        const mathChapter2 = await Chapter.create({
            subject: mathSubject._id,
            title: 'Chương 2: Hình học cơ bản',
            order: 2
        });

        await Lesson.create([
            {
                chapter: mathChapter2._id,
                title: 'Bài 1: Các hình cơ bản',
                content: `
# Các hình cơ bản

## Mục tiêu bài học
- Nhận biết các hình cơ bản
- Phân biệt được các hình

## Nội dung

### Các hình:
- 🔴 **Hình tròn**: Không có góc, cạnh cong
- 🟥 **Hình vuông**: 4 cạnh bằng nhau, 4 góc vuông
- 🔷 **Hình chữ nhật**: 2 cạnh dài, 2 cạnh ngắn
- 🔺 **Hình tam giác**: 3 cạnh, 3 góc

### Bài tập:
Tìm xung quanh con các đồ vật có hình:
1. Hình tròn (đồng hồ, bánh xe...)
2. Hình vuông (khăn tay, gạch lát...)
3. Hình chữ nhật (cửa sổ, sách vở...)

**Quan sát thật kỹ nhé!** 👀
                `,
                video_url: ''
            }
        ]);

        // Create Chapters and Lessons for English
        const engChapter1 = await Chapter.create({
            subject: englishSubject._id,
            title: 'Chapter 1: Alphabet',
            order: 1
        });

        await Lesson.create([
            {
                chapter: engChapter1._id,
                title: 'Lesson 1: Letters A-M',
                content: `
# The Alphabet: A to M

## Learning Goals
- Recognize letters A to M
- Pronounce each letter correctly

## Content

### The Letters:
**A** - Apple 🍎
**B** - Ball ⚽
**C** - Cat 🐱
**D** - Dog 🐕
**E** - Elephant 🐘
**F** - Fish 🐟
**G** - Giraffe 🦒
**H** - House 🏠
**I** - Ice cream 🍦
**J** - Juice 🧃
**K** - Kite 🪁
**L** - Lion 🦁
**M** - Monkey 🐵

### Practice:
1. Say each letter out loud
2. Draw something that starts with each letter
3. Sing the ABC song!

**Great job!** ⭐
                `,
                video_url: ''
            },
            {
                chapter: engChapter1._id,
                title: 'Lesson 2: Letters N-Z',
                content: `
# The Alphabet: N to Z

## Learning Goals
- Recognize letters N to Z
- Complete the alphabet

## Content

### The Letters:
**N** - Nose 👃
**O** - Orange 🍊
**P** - Pencil ✏️
**Q** - Queen 👑
**R** - Rainbow 🌈
**S** - Sun ☀️
**T** - Tree 🌳
**U** - Umbrella ☂️
**V** - Violin 🎻
**W** - Water 💧
**X** - X-ray
**Y** - Yellow 💛
**Z** - Zebra 🦓

### Practice:
1. Write all 26 letters
2. Find objects around you for each letter
3. Practice with a friend!

**You did it!** 🎉
                `,
                video_url: ''
            }
        ]);

        const engChapter2 = await Chapter.create({
            subject: englishSubject._id,
            title: 'Chapter 2: Numbers',
            order: 2
        });

        await Lesson.create([
            {
                chapter: engChapter2._id,
                title: 'Lesson 1: Numbers 1-10',
                content: `
# Numbers 1 to 10

## Learning Goals
- Count from 1 to 10 in English
- Write number words

## Content

### Numbers:
1. **One** - 1️⃣
2. **Two** - 2️⃣
3. **Three** - 3️⃣
4. **Four** - 4️⃣
5. **Five** - 5️⃣
6. **Six** - 6️⃣
7. **Seven** - 7️⃣
8. **Eight** - 8️⃣
9. **Nine** - 9️⃣
10. **Ten** - 🔟

### Practice:
1. Count your fingers in English
2. Write each number word 3 times
3. Count objects around you

**Keep counting!** 🔢
                `,
                video_url: ''
            }
        ]);

        // Create Chapters and Lessons for Vietnamese
        const vietChapter1 = await Chapter.create({
            subject: vietnameseSubject._id,
            title: 'Chương 1: Bảng chữ cái',
            order: 1
        });

        await Lesson.create([
            {
                chapter: vietChapter1._id,
                title: 'Bài 1: Các nguyên âm',
                content: `
# Các nguyên âm tiếng Việt

## Mục tiêu bài học
- Nhận biết 12 nguyên âm
- Phát âm đúng các nguyên âm

## Nội dung

### 12 nguyên âm:
**A, Ă, Â, E, Ê, I, O, Ô, Ơ, U, Ư, Y**

### Ví dụ từ:
- **A**: Ăn, An
- **Ă**: Ăn, Bắp
- **Â**: Ấm, Cân
- **E**: Em, Xe
- **Ê**: Ếch, Bê
- **I**: Im, Chim
- **O**: Ong, Con
- **Ô**: Ông, Cô
- **Ơ**: Ở, Bơ
- **U**: Ủ, Chuột
- **Ư**: Ưa, Mưa
- **Y**: Y tá, Yêu

### Bài tập:
1. Đọc to các nguyên âm
2. Tìm từ bắt đầu bằng mỗi nguyên âm
3. Viết mỗi nguyên âm 5 lần

**Cố gắng nhé!** 📚
                `,
                video_url: ''
            },
            {
                chapter: vietChapter1._id,
                title: 'Bài 2: Các phụ âm',
                content: `
# Các phụ âm tiếng Việt

## Mục tiêu bài học
- Nhận biết các phụ âm
- Ghép phụ âm với nguyên âm

## Nội dung

### Các phụ âm đơn:
**B, C, D, Đ, G, H, K, L, M, N, P, Q, R, S, T, V, X**

### Các phụ âm ghép:
**CH, GH, GI, KH, NG, NGH, NH, PH, TH, TR**

### Ví dụ từ:
- **B**: Ba, Bé, Bò
- **C**: Ca, Cá, Cua
- **CH**: Chim, Cha, Chó
- **D**: Da, Dê, Dưa
- **Đ**: Đá, Đèn, Đi

### Bài tập:
1. Ghép các phụ âm với nguyên âm A
2. Đọc các từ: Ba, Ca, Cha, Da, Đa
3. Viết 5 từ bắt đầu bằng phụ âm B

**Giỏi lắm!** 🌟
                `,
                video_url: ''
            }
        ]);

        const vietChapter2 = await Chapter.create({
            subject: vietnameseSubject._id,
            title: 'Chương 2: Tập đọc',
            order: 2
        });

        await Lesson.create([
            {
                chapter: vietChapter2._id,
                title: 'Bài 1: Đọc từ đơn giản',
                content: `
# Đọc từ đơn giản

## Mục tiêu bài học
- Đọc được các từ đơn giản
- Hiểu nghĩa của từ

## Nội dung

### Các từ về gia đình:
- **Ba** 👨 - Người sinh ra con (nam)
- **Mẹ** 👩 - Người sinh ra con (nữ)
- **Ông** 👴 - Ba của ba hoặc mẹ
- **Bà** 👵 - Mẹ của ba hoặc mẹ
- **Anh** 👦 - Con trai lớn hơn
- **Chị** 👧 - Con gái lớn hơn
- **Em** 👶 - Người nhỏ tuổi hơn

### Các từ về đồ vật:
- **Bàn** 🪑
- **Ghế**
- **Sách** 📚
- **Vở** 📒
- **Bút** ✏️

### Bài tập:
1. Đọc to các từ trên
2. Chỉ vào đồ vật và nói tên
3. Viết tên các thành viên trong gia đình

**Con làm tốt lắm!** 💖
                `,
                video_url: ''
            }
        ]);

        console.log('✓ Learning data seeded (3 subjects, chapters, lessons)');
    }
};

// ============================================
// Seed Exam Data
// ============================================
const seedExamData = async () => {
    const count = await Exam.countDocuments();
    if (count === 0) {
        // Get subjects for reference
        const mathSubject = await Subject.findOne({ name: 'Toán Học' });
        const engSubject = await Subject.findOne({ name: 'Tiếng Anh' });
        const vietSubject = await Subject.findOne({ name: 'Tiếng Việt' });

        if (mathSubject && engSubject && vietSubject) {
            // Math Exam
            const mathExam = await Exam.create({
                title: 'Kiểm tra Toán - Số và phép tính',
                description: 'Kiểm tra kiến thức về số đếm và phép tính cơ bản',
                duration_minutes: 15,
                subject: mathSubject._id
            });

            await Question.create([
                {
                    exam: mathExam._id,
                    content: '2 + 3 = ?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['4', '5', '6', '7'],
                    correct_answer: '5'
                },
                {
                    exam: mathExam._id,
                    content: '7 - 4 = ?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['2', '3', '4', '5'],
                    correct_answer: '3'
                },
                {
                    exam: mathExam._id,
                    content: '5 + 5 = ?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['8', '9', '10', '11'],
                    correct_answer: '10'
                },
                {
                    exam: mathExam._id,
                    content: 'Số nào lớn nhất: 3, 7, 5, 2?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['3', '7', '5', '2'],
                    correct_answer: '7'
                },
                {
                    exam: mathExam._id,
                    content: '8 - 3 = ?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['4', '5', '6', '7'],
                    correct_answer: '5'
                }
            ]);

            // English Exam
            const engExam = await Exam.create({
                title: 'English Test - Alphabet & Numbers',
                description: 'Test your knowledge of alphabet and numbers',
                duration_minutes: 10,
                subject: engSubject._id
            });

            await Question.create([
                {
                    exam: engExam._id,
                    content: 'What letter comes after "A"?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['C', 'B', 'D', 'E'],
                    correct_answer: 'B'
                },
                {
                    exam: engExam._id,
                    content: 'How do you spell the number 5?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['Four', 'Five', 'Six', 'Seven'],
                    correct_answer: 'Five'
                },
                {
                    exam: engExam._id,
                    content: 'Which word starts with "C"?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['Dog', 'Cat', 'Ball', 'Apple'],
                    correct_answer: 'Cat'
                },
                {
                    exam: engExam._id,
                    content: 'What number comes after 7?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['6', '8', '9', '10'],
                    correct_answer: '8'
                }
            ]);

            // Vietnamese Exam
            const vietExam = await Exam.create({
                title: 'Kiểm tra Tiếng Việt - Bảng chữ cái',
                description: 'Kiểm tra kiến thức về bảng chữ cái tiếng Việt',
                duration_minutes: 10,
                subject: vietSubject._id
            });

            await Question.create([
                {
                    exam: vietExam._id,
                    content: 'Đâu là nguyên âm?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['B', 'A', 'C', 'D'],
                    correct_answer: 'A'
                },
                {
                    exam: vietExam._id,
                    content: '"CH" là phụ âm gì?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['Phụ âm đơn', 'Phụ âm ghép', 'Nguyên âm', 'Dấu thanh'],
                    correct_answer: 'Phụ âm ghép'
                },
                {
                    exam: vietExam._id,
                    content: 'Từ "Mẹ" bắt đầu bằng chữ gì?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['N', 'M', 'L', 'K'],
                    correct_answer: 'M'
                },
                {
                    exam: vietExam._id,
                    content: 'Có bao nhiêu nguyên âm trong tiếng Việt?',
                    question_type: 'multiple_choice',
                    points: 1,
                    options: ['10', '11', '12', '13'],
                    correct_answer: '12'
                }
            ]);

            console.log('✓ Exam data seeded (3 exams with questions)');
        }
    }
};

// ============================================
// Seed Explore Data (Categories & Activities)
// ============================================
const seedExploreData = async () => {
    const count = await ExploreCategory.countDocuments();
    if (count === 0) {
        // Create Categories
        const gamesCategory = await ExploreCategory.create({
            name: 'Trò Chơi',
            slug: 'games',
            description: 'Học qua trò chơi vui nhộn',
            icon: 'fa-gamepad',
            color: 'primary',
            order: 1
        });

        const storiesCategory = await ExploreCategory.create({
            name: 'Truyện Hay',
            slug: 'stories',
            description: 'Kho tàng truyện cổ tích',
            icon: 'fa-book-reader',
            color: 'success',
            order: 2
        });

        const videosCategory = await ExploreCategory.create({
            name: 'Video',
            slug: 'videos',
            description: 'Video học tập thú vị',
            icon: 'fa-play-circle',
            color: 'danger',
            order: 3
        });

        const craftsCategory = await ExploreCategory.create({
            name: 'Thủ Công',
            slug: 'crafts',
            description: 'Sáng tạo với đôi tay',
            icon: 'fa-palette',
            color: 'warning',
            order: 4
        });

        const musicCategory = await ExploreCategory.create({
            name: 'Âm Nhạc',
            slug: 'music',
            description: 'Bài hát và nhạc cụ',
            icon: 'fa-music',
            color: 'info',
            order: 5
        });

        const puzzlesCategory = await ExploreCategory.create({
            name: 'Câu Đố',
            slug: 'puzzles',
            description: 'Thử thách trí tuệ',
            icon: 'fa-puzzle-piece',
            color: 'secondary',
            order: 6
        });

        const experimentsCategory = await ExploreCategory.create({
            name: 'Thí Nghiệm',
            slug: 'experiments',
            description: 'Khoa học vui',
            icon: 'fa-flask',
            color: 'accent',
            order: 7
        });

        const quizCategory = await ExploreCategory.create({
            name: 'Quiz',
            slug: 'quiz',
            description: 'Trắc nghiệm vui',
            icon: 'fa-question-circle',
            color: 'primary',
            order: 8
        });

        // Create Activities
        await ExploreActivity.create([
            // Games
            {
                title: 'Toán Học Vui',
                slug: 'math-fun',
                description: 'Giải các phép tính nhanh để nhận sao thưởng! Thử thách khả năng tính toán của bạn.',
                category: gamesCategory._id,
                type: 'game',
                icon: 'fa-calculator',
                color: 'primary',
                difficulty: 'easy',
                duration: 5,
                starsReward: 10,
                instructions: '<ol><li>Đọc kỹ phép tính hiện ra trên màn hình</li><li>Nhập đáp án vào ô trống</li><li>Nhấn Enter hoặc nút "Trả lời"</li><li>Hoàn thành 10 câu để nhận sao!</li></ol>',
                isFeatured: true,
                isNewActivity: true,
                playCount: 1234
            },
            {
                title: 'Ghép Hình Động Vật',
                slug: 'animal-puzzle',
                description: 'Ghép các mảnh hình để tạo thành con vật đáng yêu. Rèn luyện tư duy logic!',
                category: puzzlesCategory._id,
                type: 'puzzle',
                icon: 'fa-puzzle-piece',
                color: 'success',
                difficulty: 'easy',
                duration: 10,
                starsReward: 15,
                instructions: '<ol><li>Quan sát hình mẫu ở góc màn hình</li><li>Kéo các mảnh ghép vào đúng vị trí</li><li>Hoàn thành hình để nhận sao!</li></ol>',
                isFeatured: true,
                playCount: 2156,
                rating: 4.5,
                ratingCount: 128
            },
            {
                title: 'Trí Nhớ Siêu Phàm',
                slug: 'memory-master',
                description: 'Tìm các cặp hình giống nhau. Rèn luyện trí nhớ một cách vui nhộn!',
                category: gamesCategory._id,
                type: 'puzzle',
                icon: 'fa-brain',
                color: 'warning',
                difficulty: 'medium',
                duration: 8,
                starsReward: 12,
                instructions: '<ol><li>Lật hai thẻ để xem hình bên trong</li><li>Tìm và ghép các cặp hình giống nhau</li><li>Nhớ vị trí các thẻ đã lật</li><li>Hoàn thành tất cả các cặp để thắng!</li></ol>',
                isFeatured: true,
                isNewActivity: true,
                playCount: 987,
                rating: 4.2,
                ratingCount: 95
            },
            // Stories
            {
                title: 'Tấm Cám',
                slug: 'tam-cam',
                description: 'Câu chuyện cổ tích Việt Nam về cô Tấm hiền lành và mẹ con Cám độc ác.',
                category: storiesCategory._id,
                type: 'story',
                icon: 'fa-book-open',
                color: 'danger',
                difficulty: 'easy',
                duration: 15,
                starsReward: 5,
                isFeatured: true,
                playCount: 3456,
                rating: 5,
                ratingCount: 256
            },
            {
                title: 'Sọ Dừa',
                slug: 'so-dua',
                description: 'Truyện cổ tích về chàng Sọ Dừa thông minh, tài giỏi.',
                category: storiesCategory._id,
                type: 'story',
                icon: 'fa-book-open',
                color: 'success',
                difficulty: 'easy',
                duration: 12,
                starsReward: 5,
                playCount: 2100
            },
            // Music
            {
                title: 'Học Hát Cùng Bé',
                slug: 'learn-to-sing',
                description: 'Những bài hát thiếu nhi hay nhất! Hát theo và học thuộc lời.',
                category: musicCategory._id,
                type: 'music',
                icon: 'fa-music',
                color: 'info',
                difficulty: 'easy',
                duration: 8,
                starsReward: 5,
                isNewActivity: true,
                playCount: 1567
            },
            // Crafts
            {
                title: 'Gấp Giấy Origami',
                slug: 'origami',
                description: 'Học cách gấp các con vật bằng giấy theo nghệ thuật Origami Nhật Bản.',
                category: craftsCategory._id,
                type: 'craft',
                icon: 'fa-paper-plane',
                color: 'warning',
                difficulty: 'medium',
                duration: 20,
                starsReward: 15,
                materials: ['Giấy màu', 'Bút màu', 'Kéo (nếu cần)'],
                instructions: '<ol><li>Chuẩn bị giấy vuông</li><li>Xem video hướng dẫn</li><li>Gấp từng bước theo hướng dẫn</li><li>Hoàn thành và chụp ảnh sản phẩm!</li></ol>',
                isFeatured: true,
                playCount: 890
            },
            {
                title: 'Tô Màu Sáng Tạo',
                slug: 'coloring',
                description: 'Thỏa sức sáng tạo với bảng màu đa dạng! Tô màu các hình vẽ đẹp mắt.',
                category: craftsCategory._id,
                type: 'craft',
                icon: 'fa-palette',
                color: 'danger',
                difficulty: 'easy',
                duration: 15,
                starsReward: 8,
                isNewActivity: true,
                playCount: 2345
            },
            // Experiments
            {
                title: 'Núi Lửa Phun Trào',
                slug: 'volcano',
                description: 'Thí nghiệm tạo núi lửa phun trào với baking soda và giấm!',
                category: experimentsCategory._id,
                type: 'experiment',
                icon: 'fa-flask',
                color: 'danger',
                difficulty: 'medium',
                duration: 20,
                starsReward: 20,
                materials: ['Baking soda', 'Giấm', 'Màu thực phẩm đỏ', 'Đất nặn hoặc chai nhựa'],
                instructions: '<ol><li>Tạo hình núi lửa bằng đất nặn</li><li>Đặt cốc nhỏ vào giữa</li><li>Cho baking soda vào cốc</li><li>Thêm màu đỏ và giấm</li><li>Quan sát "núi lửa" phun trào!</li></ol>',
                playCount: 456
            },
            // Quiz
            {
                title: 'Đố Vui Động Vật',
                slug: 'animal-quiz',
                description: 'Trắc nghiệm vui về thế giới động vật. Bạn biết gì về các con vật?',
                category: quizCategory._id,
                type: 'quiz',
                icon: 'fa-paw',
                color: 'success',
                difficulty: 'easy',
                duration: 10,
                starsReward: 10,
                playCount: 1789
            },
            {
                title: 'Đánh Vần Tiếng Việt',
                slug: 'spelling-vietnamese',
                description: 'Luyện đánh vần cùng các bạn nhỏ! Học cách ghép vần và đọc từ.',
                category: gamesCategory._id,
                type: 'game',
                icon: 'fa-spell-check',
                color: 'success',
                difficulty: 'easy',
                duration: 10,
                starsReward: 15,
                isNewActivity: true,
                playCount: 678
            }
        ]);

        console.log('✓ Explore data seeded (8 categories, 12 activities)');
    }
};

// ============================================
// Seed Admin User
// ============================================
const seedAdminUser = async () => {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
        await User.create({
            username: 'admin',
            email: 'admin@starreward.com',
            password: 'admin123',
            fullName: 'Administrator',
            role: 'admin'
        });
        console.log('✓ Admin user created (username: admin, password: admin123)');
    }

    // Create some sample users for testing
    const userCount = await User.countDocuments();
    if (userCount < 5) {
        const sampleUsers = [
            {
                username: 'student1',
                email: 'student1@test.com',
                password: 'password123',
                fullName: 'Nguyễn Văn A',
                role: 'student'
            },
            {
                username: 'parent1',
                email: 'parent1@test.com',
                password: 'password123',
                fullName: 'Trần Thị B',
                role: 'parent'
            },
            {
                username: 'teacher1',
                email: 'teacher1@test.com',
                password: 'password123',
                fullName: 'Lê Văn C',
                role: 'teacher'
            }
        ];

        for (const userData of sampleUsers) {
            const exists = await User.findOne({ username: userData.username });
            if (!exists) {
                await User.create(userData);
            }
        }
        console.log('✓ Sample users created');
    }
};

// ============================================
// Main Seed Function
// ============================================
const initSeedData = async () => {
    try {
        await seedAdminUser();
        await seedDailyTasks();
        await seedLearningData();
        await seedExamData();
        await seedExploreData();
        console.log('--- All seed data initialized ---');
    } catch (err) {
        console.error('Error seeding data:', err);
    }
};

module.exports = initSeedData;
