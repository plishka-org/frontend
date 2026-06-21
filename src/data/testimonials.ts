import reviewImage from '../assets/block-reviews/reviews.webp'
import reviewImage2 from '../assets/block-reviews/reviews-2.webp'
import reviewImage3 from '../assets/block-reviews/reviews-3.webp'
import reviewImage4 from '../assets/block-reviews/reviews-4.webp'

export type Testimonial = {
  id: number
  author: string
  text: string
  images: string[]
  cardImage: string
  createdAt: string
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    author: 'Олексій Ковальов',
    text: 'Чудова якість, дуже задоволена замовленням! Все підійшло до дворика дуже добре. Рекомендую.',
    images: [reviewImage, reviewImage2, reviewImage3],
    cardImage: reviewImage2,
    createdAt: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 2,
    author: 'Олексій Ковальов',
    text: 'Дуже вдячний майстерні за такий гарний виріб',
    images: [reviewImage2, reviewImage4, reviewImage3],
    cardImage: reviewImage4,
    createdAt: '2026-04-02T10:00:00.000Z',
  },
  {
    id: 3,
    author: 'Олексій Ковальов',
    text: 'Дуже вдячний майстерні за такий гарний виріб',
    images: [reviewImage4, reviewImage3, reviewImage],
    cardImage: reviewImage4,
    createdAt: '2026-04-03T10:00:00.000Z',
  },
  {
    id: 4,
    author: 'Олексій Ковальов',
    text: 'Дуже вдячний майстерні за такий гарний виріб',
    images: [reviewImage3, reviewImage4, reviewImage2],
    cardImage: reviewImage4,
    createdAt: '2026-04-04T10:00:00.000Z',
  },
  {
    id: 5,
    author: 'Марія Гнатюк',
    text: 'Дуже акуратна ручна робота. Альтанка стала улюбленим місцем для відпочинку всієї родини.',
    images: [reviewImage2, reviewImage, reviewImage3],
    cardImage: reviewImage,
    createdAt: '2026-04-05T10:00:00.000Z',
  },
  {
    id: 6,
    author: 'Андрій Савчук',
    text: 'Все сподобалось: від консультації до встановлення. Виріб виглядає саме так, як хотіли.',
    images: [reviewImage3, reviewImage2, reviewImage4],
    cardImage: reviewImage3,
    createdAt: '2026-04-06T10:00:00.000Z',
  },
  {
    id: 7,
    author: 'Наталія Коваль',
    text: 'Замовлення виконали вчасно, дерево гарно оброблене, конструкція виглядає надійно і затишно.',
    images: [reviewImage4, reviewImage, reviewImage2],
    cardImage: reviewImage4,
    createdAt: '2026-04-07T10:00:00.000Z',
  },
  {
    id: 8,
    author: 'Іван Мельник',
    text: 'Майстри уважно врахували побажання, виріб вийшов міцний і дуже охайний. Дякую за роботу.',
    images: [reviewImage, reviewImage3, reviewImage4],
    cardImage: reviewImage3,
    createdAt: '2026-04-08T10:00:00.000Z',
  },
  {
    id: 9,
    author: 'Оксана Мороз',
    text: 'Виріб вийшов дуже гарний, усе зроблено акуратно та з любовʼю до деталей.',
    images: [reviewImage2, reviewImage4, reviewImage],
    cardImage: reviewImage2,
    createdAt: '2026-04-09T10:00:00.000Z',
  },
  {
    id: 10,
    author: 'Сергій Ткаченко',
    text: 'Якість дерева і збірки приємно здивувала. Дякую за відповідальний підхід.',
    images: [reviewImage4, reviewImage3, reviewImage2],
    cardImage: reviewImage4,
    createdAt: '2026-04-10T10:00:00.000Z',
  },
  {
    id: 11,
    author: 'Людмила Шевченко',
    text: 'Замовлення виконали уважно до побажань, результат виглядає дуже затишно.',
    images: [reviewImage, reviewImage2, reviewImage4],
    cardImage: reviewImage,
    createdAt: '2026-04-11T10:00:00.000Z',
  },
  {
    id: 12,
    author: 'Юрій Бондар',
    text: 'Комунікація була легкою, а готовий виріб повністю відповідає очікуванням.',
    images: [reviewImage3, reviewImage, reviewImage4],
    cardImage: reviewImage3,
    createdAt: '2026-04-12T10:00:00.000Z',
  },
  {
    id: 13,
    author: 'Катерина Лисенко',
    text: 'Дуже сподобалась якість обробки. Виріб став справжньою прикрасою подвірʼя.',
    images: [reviewImage2, reviewImage3, reviewImage],
    cardImage: reviewImage2,
    createdAt: '2026-04-13T10:00:00.000Z',
  },
  {
    id: 14,
    author: 'Павло Кравець',
    text: 'Все зроблено міцно, охайно і в домовлені строки. Рекомендую майстерню.',
    images: [reviewImage4, reviewImage2, reviewImage3],
    cardImage: reviewImage4,
    createdAt: '2026-04-14T10:00:00.000Z',
  },
  {
    id: 15,
    author: 'Ірина Романюк',
    text: 'Отримали саме те, що хотіли. Видно, що майстри вкладають душу в роботу.',
    images: [reviewImage, reviewImage4, reviewImage2],
    cardImage: reviewImage,
    createdAt: '2026-04-15T10:00:00.000Z',
  },
  {
    id: 16,
    author: 'Віктор Дорошенко',
    text: 'Конструкція надійна, вигляд чудовий, усе підійшло до нашого саду.',
    images: [reviewImage3, reviewImage2, reviewImage],
    cardImage: reviewImage3,
    createdAt: '2026-04-16T10:00:00.000Z',
  },
  {
    id: 17,
    author: 'Богдан Остапенко',
    text: 'Дуже сподобалась робота майстрів. Все виглядає охайно і надійно.',
    images: [reviewImage2, reviewImage4, reviewImage],
    cardImage: reviewImage2,
    createdAt: '2026-04-17T10:00:00.000Z',
  },
  {
    id: 18,
    author: 'Анна Кириленко',
    text: 'Замовлення виконали уважно, результат повністю відповідає нашим очікуванням.',
    images: [reviewImage4, reviewImage3, reviewImage2],
    cardImage: reviewImage4,
    createdAt: '2026-04-18T10:00:00.000Z',
  },
]
