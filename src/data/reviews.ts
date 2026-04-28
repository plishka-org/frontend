import reviewImage from '../assets/block-reviews/reviews.svg'

export type Review = {
  id: number
  author: string
  text: string
  images: string[]
}

const reviewImages = [reviewImage, reviewImage, reviewImage]

export const reviews: Review[] = [
  {
    id: 1,
    author: 'Ольга Петрова',
    text: 'Чудова якість, дуже задоволена замовленням! Все підійшло до дворика дуже добре. Рекомендую.',
    images: reviewImages,
  },
  {
    id: 2,
    author: 'Іван Мельник',
    text: 'Майстри уважно врахували побажання, виріб вийшов міцний і дуже охайний. Дякую за роботу.',
    images: reviewImages,
  },
  {
    id: 3,
    author: 'Наталія Коваль',
    text: 'Замовлення виконали вчасно, дерево гарно оброблене, конструкція виглядає надійно і затишно.',
    images: reviewImages,
  },
  {
    id: 4,
    author: 'Андрій Савчук',
    text: 'Все сподобалось: від консультації до встановлення. Виріб виглядає саме так, як хотіли.',
    images: reviewImages,
  },
  {
    id: 5,
    author: 'Марія Гнатюк',
    text: 'Дуже акуратна ручна робота. Альтанка стала улюбленим місцем для відпочинку всієї родини.',
    images: reviewImages,
  },
]
