import gallery1 from '../assets/galery-block/galery-1.webp'
import gallery2 from '../assets/galery-block/galery-2.webp'
import gallery3 from '../assets/galery-block/galery-3.webp'
import gallery4 from '../assets/galery-block/galery-4.webp'
import gallery5 from '../assets/galery-block/galery-5.webp'
import gallery6 from '../assets/galery-block/galery-6.webp'

export type GalleryProduct = {
  id: string
  category: string
  name: string
  image: string
  price: number
}

const galleryPageProducts: GalleryProduct[] = [
  {
    id: 'gallery-gazebo-classic',
    category: 'Альтанки',
    name: 'Альтанка',
    image: gallery1,
    price: 1800,
  },
  {
    id: 'gallery-gazebo-octagonal',
    category: 'Альтанки',
    name: 'Восьмикутна альтанка',
    image: gallery2,
    price: 2400,
  },
  {
    id: 'gallery-gazebo-large',
    category: 'Альтанки',
    name: 'Альтанка 3М*3,5М',
    image: gallery3,
    price: 2600,
  },
  {
    id: 'gallery-gazebo-bench',
    category: 'Альтанки',
    name: 'Альтанка 3,5М*2,5М',
    image: gallery4,
    price: 2200,
  },
  {
    id: 'gallery-gazebo-small',
    category: 'Альтанки',
    name: 'Альтанка 3М*2М',
    image: gallery5,
    price: 2000,
  },
  {
    id: 'gallery-gazebo-paving',
    category: 'Альтанки',
    name: 'Альтанка на бруківці 3,30М*3,30М',
    image: gallery6,
    price: 2800,
  },
  {
    id: 'gallery-gazebo-bench-copy',
    category: 'Альтанки',
    name: 'Альтанка 3,5М*2,5М',
    image: gallery4,
    price: 2200,
  },
  {
    id: 'gallery-gazebo-small-copy',
    category: 'Альтанки',
    name: 'Альтанка 3М*2М',
    image: gallery5,
    price: 2000,
  },
  {
    id: 'gallery-gazebo-paving-copy',
    category: 'Альтанки',
    name: 'Альтанка на бруківці 3,30М*3,30М',
    image: gallery6,
    price: 2800,
  },
  {
    id: 'gallery-gazebo-bench-extra',
    category: 'Альтанки',
    name: 'Альтанка 3,5М*2,5М',
    image: gallery4,
    price: 2200,
  },
  {
    id: 'gallery-gazebo-small-extra',
    category: 'Альтанки',
    name: 'Альтанка 3М*2М',
    image: gallery5,
    price: 2000,
  },
  {
    id: 'gallery-gazebo-paving-extra',
    category: 'Альтанки',
    name: 'Альтанка на бруківці 3,30М*3,30М',
    image: gallery6,
    price: 2800,
  },
]

export const galleryProducts: GalleryProduct[] = Array.from({ length: 4 }, (_, pageIndex) =>
  galleryPageProducts.map((product) => ({
    ...product,
    id: pageIndex === 0 ? product.id : `${product.id}-page-${pageIndex + 1}`,
  })),
).flat()

export const galleryCategories = [
  'Усі категорії',
  'Альтанки',
  'Ворота,паркани',
  'Вуличні стільці',
  'Вироби для садочків',
  'Вироби під замовлення',
  'Дитячі майданчики',
  'Двері',
  'Качелі',
  'Ліжка',
  'Навіси',
  'Перголи/поки',
  'Полиці для писанок',
  'Полиці для спецій',
  'Перегородки/решітки',
  'Пісочниці',
  'Речі декору',
  'Сувенірна продукція',
  'Столики та лавочки',
  'Скрині',
  'Стійки для одягу',
  'Шезлонги',
  'Ящики',
]
