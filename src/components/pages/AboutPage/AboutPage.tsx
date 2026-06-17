import aboutHeroImage from '../../../assets/block-about/About-1.svg'
import aboutTodayImage from '../../../assets/block-about/About-2.svg'
import aboutGalleryMainImage from '../../../assets/block-about/About-3.svg'
import aboutGalleryFrameImage from '../../../assets/block-about/About-4.svg'
import aboutGalleryYardImage from '../../../assets/block-about/About-5.svg'
import aboutGallerySummerImage from '../../../assets/block-about/About-6.svg'
import aboutGalleryWinterImage from '../../../assets/block-about/About-7.svg'
import type { SiteVariant } from '../../../utils/siteVariant'
import { Footer } from '../../layout/Footer/Footer'
import { Header } from '../../layout/Header/Header'
import ContactForm from '../../sections/ContactForm/ContactForm'
import { ContactsSection } from '../../sections/Contacts/ContactsSection'
import { ReviewsSection } from '../../sections/Reviews/ReviewsSection'

type AboutPageProps = {
  siteVariant: SiteVariant
}

const introParagraphs = [
  'Назва бренду народилася у 2022 році - прямо під час роботи над терасою. Стоячи на даху разом із командою, ми шукали слово, яке б передавало суть нашої справи: любов до дерева, майстерність і увагу до деталей.',
  'Ми хотіли, щоб назва звучала легко, запамʼятовувалась і однаково гарно сприймалась українською та англійською. Так зʼявилась Plishka - від слова «плішка», що означає тріску дерева, базовий елемент, з якого починається щось більше.',
]

const todayText =
  'Сьогодні Plishka - це не просто майстерня. Це про створення виробів із характером: натуральних, довговічних і продуманих до дрібниць. Кожен наш проект - це баланс естетики, функціональності та ручної роботи.'

export function AboutPage({ siteVariant }: AboutPageProps) {
  return (
    <main className="page-shell about-page">
      <Header activePage="about" siteVariant={siteVariant} />
      <section className="about-story" aria-labelledby="about-page-title">
        <div className="about-story__inner">
          <article className="about-story-block about-story-block--intro about-reveal">
            <div className="about-story-block__text">
              <h1 id="about-page-title">Plishka - це історія, що почалася з дерева</h1>
              {introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <img
              className="about-story-block__image"
              src={aboutHeroImage}
              alt="Деревʼяна споруда майстерні Plishka серед зелені"
              decoding="async"
            />
          </article>

          <article className="about-story-block about-story-block--today about-reveal">
            <img
              className="about-story-block__image"
              src={aboutTodayImage}
              alt="Деталі деревʼяної покрівлі споруди Plishka"
              loading="lazy"
              decoding="async"
            />
            <div className="about-story-block__text">
              <h2>Plishka - сьогодні</h2>
              <p>{todayText}</p>
            </div>
          </article>

          <div className="about-gallery about-reveal" aria-label="Фото майстерні Plishka">
            <div className="about-gallery__top">
              <div className="about-gallery__stack">
                <img
                  alt="Деревʼяна господарська будівля біля майстерні"
                  className="about-gallery__item about-gallery__item--small"
                  src={aboutGalleryYardImage}
                  loading="lazy"
                  decoding="async"
                />
                <img
                  alt="Деревʼяний каркас конструкції біля майстерні"
                  className="about-gallery__item about-gallery__item--small"
                  src={aboutGalleryFrameImage}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <img
                alt="Накрита деревʼяна конструкція на території майстерні"
                className="about-gallery__item about-gallery__item--main"
                src={aboutGalleryMainImage}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-gallery__bottom">
              <img
                alt="Літній вигляд деревʼяної споруди Plishka"
                className="about-gallery__item about-gallery__item--large"
                src={aboutGallerySummerImage}
                loading="lazy"
                decoding="async"
              />
              <img
                alt="Деревʼяна споруда Plishka восени"
                className="about-gallery__item about-gallery__item--large"
                src={aboutGalleryWinterImage}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>
      <ReviewsSection siteVariant={siteVariant} />
      <ContactForm />
      <ContactsSection />
      <Footer />
    </main>
  )
}
