import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { WeatherWidget, Slider, AnimationText } from "../../components";
import { sliderData } from "../../constants/sliderData";
import {
  LocalOffer,
  PersonAdd,
  Star,
  Discount,
  ArrowForward,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { partners } from "../../constants/partners";
import styles from "./Home.module.css";

const Home: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % partners.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handlePartnerClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.container}>
      <WeatherWidget />
      <Slider slides={sliderData} autoPlayInterval={5000} />
      <section className={styles.hero}>
        <div className={styles.logoContainer}>
          <img
            src="/logo-stroy.png"
            alt="Stroy City Logo"
            className={styles.logo}
          />
        </div>
        <AnimationText textColor="#2196f3" />
        <p className={styles.subtitle}>
          Лучшие строительные и кровельные материалы по доступным ценам
        </p>
        <Link to="/catalog" className={styles.ctaButton}>
          ПЕРЕЙТИ В КАТАЛОГ
        </Link>
      </section>

      {!isAuthenticated && (
        <section className={styles.discountBanner}>
          <h2 className={styles.discountTitle}>
            <LocalOffer className={styles.discountIcon} />
            Специальное предложение для гостей!
          </h2>
          <p className={styles.discountText}>
            Зарегистрируйтесь на нашем сайте и получите дополнительную скидку 5%
            на все товары при оформлении заказа. Это отличная возможность
            сэкономить на покупке качественных строительных и кровельных
            материалов!
          </p>
          <div className={styles.discountFeatures}>
            <div className={styles.discountFeature}>
              <Star className={styles.discountFeatureIcon} />
              <span>Эксклюзивные предложения</span>
            </div>
            <div className={styles.discountFeature}>
              <Discount className={styles.discountFeatureIcon} />
              <span>Постоянная скидка 5%</span>
            </div>
          </div>
          <Link to="/register" className={styles.discountButton}>
            <PersonAdd className={styles.discountIcon} />
            Зарегистрироваться и получить скидку
            <ArrowForward className={styles.discountIcon} />
          </Link>
        </section>
      )}

      <section className={styles.features}>
        <div className={styles.feature}>
          <h3>Широкий выбор</h3>
          <p>Большой ассортимент строительных материалов различных категорий</p>
        </div>
        <div className={styles.feature}>
          <h3>Быстрая доставка</h3>
          <p>Доставка по всей республике в кратчайшие сроки</p>
        </div>
        <div className={styles.feature}>
          <h3>Гарантия качества</h3>
          <p>Все товары проходят строгий контроль качества</p>
        </div>
      </section>

      <section className={styles.about}>
        <h2>О нашем магазине</h2>
        <p>
          Мы рады приветствовать вас в Stroy City! Наш магазин уже более 10 лет
          предоставляет качественные строительные материалы нашим клиентам. Мы
          гордимся тем, что можем предложить вам широкий выбор продукции по
          конкурентным ценам.
        </p>
        <p>
          Наша миссия - сделать покупки строительных материалов максимально
          удобными и приятными для каждого клиента. Мы постоянно работаем над
          улучшением сервиса и расширением ассортимента.
        </p>
      </section>

      <section className={styles.materialsStore}>
        <h3>Магазин строительных материалов для строительства и ремонта</h3>
        <p>
          Магазин Stroy City предлагает купить строительные материалы в г.
          Владикавказ для ремонта и строительства. Мы сотрудничаем с ведущими
          производителями кровельных, фасадных материалов и сопутствующих
          товаров.
        </p>
      </section>

      <section className={styles.qualityAssurance}>
        <h3>Гарантия качества</h3>
        <p>
          Наш магазин поставляет материалы для строительства в любых количествах
          по доступным ценам, с гарантией качества от производителя. Нашими
          покупателями являются частные покупатели, крупные фирмы, торговые
          сети, а так же производства и офисные центры.
        </p>
      </section>

      <section className={styles.trustAndExperience}>
        <h3>Доверие и опыт</h3>
        <p>
          Вдумчивая серьезная работа (более 20 лет на рынке) дала свои
          результаты, и теперь наш клиент может быть уверен в том, что он сможет
          купить только проверенные годами строительные материалы, качество
          которых подтверждено сертификатами.
        </p>
      </section>

      <section className={styles.partners}>
        <h2>Наши партнеры</h2>
        <p>
          Мы сотрудничаем с ведущими производителями строительных материалов,
          что позволяет нам предлагать нашим клиентам только качественную
          продукцию по конкурентным ценам.
        </p>
        <div className={styles.partnersGrid}>
          {partners.map((partner, index) => (
            <div
              key={partner.id}
              className={styles.partnerLogoContainer}
              onClick={() => handlePartnerClick(partner.url)}
              title={partner.name}
            >
              <img
                src={`/${String(partner.id).padStart(2, "0")}.png`}
                alt={partner.name}
                className={`${styles.partnerLogo} ${
                  index === currentIndex ? styles.glowing : ""
                }`}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
