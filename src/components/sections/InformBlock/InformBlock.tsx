import { useEffect, useState } from 'react'
import "../../../styles/sections/_inform-block.scss";
import { getGalleryUrl } from '../../../utils/productUrl'
import { getHomeApi } from '../../../services/api/contentApi'

export function InformBlock() {
  const [content, setContent] = useState({
    title: 'Вдячні, що ви обрали саме нас',
    description: 'Наше домашнє виробництво більше 12 років спеціалізується на різних виробах з деревини та не тільки',
  })

  useEffect(() => {
    getHomeApi().then((home) => setContent({ ...home.content, description: home.content.description ?? '' })).catch(() => undefined)
  }, [])

  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">
          {content.title}
        </h1>
      </div>

      <div className="hero__bottom">
        <div className="hero__buttons">
          <a href={getGalleryUrl()} className="hero__btn hero__btn--primary">
            Перейти до товарів
          </a>
          <a href="#contacts" className="hero__btn hero__btn--outline">
            Зв'язатися з нами
          </a>
        </div>
        <div className="hero__description">
          <p>{content.description}</p>
        </div>
      </div>
    </section>
  );
}
