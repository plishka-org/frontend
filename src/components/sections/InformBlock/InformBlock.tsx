import "../../../styles/sections/_inform-block.scss";
import { getGalleryUrl } from '../../../utils/productUrl'
import type { SiteVariant } from '../../../utils/siteVariant'

type InformBlockProps = {
  siteVariant: SiteVariant
}

export function InformBlock({ siteVariant }: InformBlockProps) {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">
          Вдячні, що ви
          <br />
          обрали саме нас
        </h1>
      </div>

      <div className="hero__bottom">
        <div className="hero__buttons">
          <a href={getGalleryUrl(siteVariant)} className="hero__btn hero__btn--primary">
            Перейти до товарів
          </a>
          <a href="#contacts" className="hero__btn hero__btn--outline">
            Зв'язатися з нами
          </a>
        </div>
        <div className="hero__description">
          <p>
            Наше домашнє виробництво більше 12 років спеціалізується на різних
            виробах з деревини та не тільки
          </p>
        </div>
      </div>
    </section>
  );
}