import product1 from '../assets/best-products/product-1.svg'
import product2 from '../assets/best-products/product-2.svg'
import product3 from '../assets/best-products/product-3.svg'
import product4 from '../assets/best-products/product-4.svg'

export type BestProduct = {
  id: string
  category: string
  name: string
  displayName?: string
  description: string
  image: string
  gallery: string[]
  price: number
}

export const bestProducts: BestProduct[] = [
  {
    id: 'gazebo-classic',
    category: 'Альтанки',
    name: 'Альтанка',
    description:
      'Дерев’яна альтанка ручної роботи — це затишний простір для родини та гостей. Виготовлена з якісної деревини, вона поєднує природну фактуру, міцність і продуманий дизайн для комфортного відпочинку на подвір’ї.',
    image: product1,
    gallery: [product2, product1, product3, product4, product1, product2],
    price: 1800,
  },
  {
    id: 'swing-classic',
    category: 'Гойдалки',
    name: 'Гойдалка',
    description:
      'Дерев’яна гойдалка ручної роботи — це поєднання натуральних матеріалів, міцності та естетики. Виготовлена з якісної деревини, вона забезпечує надійність і довговічність, а продуманий дизайн додає затишку будь-якому простору — від саду до тераси. Ідеальний вибір для комфортного відпочинку та атмосферних моментів на свіжому повітрі.',
    image: product2,
    gallery: [product1, product2, product4, product3, product2, product1],
    price: 1500,
  },
  {
    id: 'gazebo-octagonal',
    category: 'Альтанки',
    name: 'Восьмикутна альтанка',
    displayName: 'Восьмикутна альтан...',
    description:
      'Восьмикутна альтанка створена для просторого й красивого відпочинку на подвір’ї. Її форма додає виробу виразності, а натуральна деревина та ручна робота роблять конструкцію міцною, охайною і довговічною.',
    image: product3,
    gallery: [product1, product3, product2, product4, product3, product1],
    price: 2400,
  },
  {
    id: 'bench-classic',
    category: 'Лавки',
    name: 'Лавка',
    description:
      'Дерев’яна лавка ручної роботи пасує для саду, тераси або зони відпочинку біля будинку. Виріб має стійку конструкцію, природний вигляд і зручні пропорції для щоденного використання.',
    image: product4,
    gallery: [product2, product4, product1, product3, product4, product2],
    price: 900,
  },
]

export function getProductById(productId: string) {
  return bestProducts.find((product) => product.id === productId)
}

export function getRelatedProducts(product: BestProduct) {
  const sameCategory = bestProducts.filter((item) => item.category === product.category)
  const otherProducts = bestProducts.filter((item) => item.category !== product.category)

  return [...sameCategory, ...otherProducts].slice(0, 4)
}
