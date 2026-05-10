import '../../../styles/sections/_advantages.scss';

import locationIcon from '../../../icons/Type=Location.png';
import eyeIcon from '../../../icons/Type=Eye.png';
import packIcon from '../../../icons/Type=Pack.png';
import timeIcon from '../../../icons/Type=Time.png'

const advantages = [
  { icon: locationIcon, title: 'Чудове розташування', desc: 'Зручно дістатися з будь-якої частини міста.' },
  { icon: eyeIcon, title: 'Можливість відвідати майстерню', desc: 'Переконайтесь у якості матеріалів і роботи майстрів.' },
  { icon: packIcon, title: 'Власне пакування, обрешетування, каркаси', desc: 'Надійно пакуємо вироби для безпечного транспортування.' },
  { icon: timeIcon, title: 'Швидка відправка', desc: 'Оперативно обробляємо та відправляємо замовлення.' },
];

export default function Advantages() {
  return (
    <section className="advantages">
      {advantages.map((item, i) => (
        <div className="advantages__card" key={i}>
          <div className="advantages__icon">
            <img src={item.icon} alt={item.title} />
          </div>
          <h3 className="advantages__title">{item.title}</h3>
          <p className="advantages__desc">{item.desc}</p>
        </div>
      ))}
    </section>
  );
}