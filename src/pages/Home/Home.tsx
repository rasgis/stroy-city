import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Slider } from "../../components";
import { sliderData } from "./data/sliderData";
import {
  LocalOffer,
  PersonAdd,
  Star,
  Discount,
  ArrowForward,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useAppDispatch } from "../../hooks";
import {
  fetchCategories,
  selectFilteredCategories,
} from "../../reducers/categories";
import { fetchProducts } from "../../reducers/products";
import { scrollToTop } from "../../utils/scroll";
import styles from "./Home.module.css";
import { ROUTES } from "../../constants/routes";
import { partners } from "./data/partners";

const Home: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [lastActiveFeature, setLastActiveFeature] = useState<number | null>(
    null
  );
  const featuresRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [particlesCreated, setParticlesCreated] = useState(false);

  const handlePartnerClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleFeatureMouseEnter = (index: number) => {
    setActiveFeature(index);
    setLastActiveFeature(index);
  };

  const handleFeatureMouseLeave = () => {
    setActiveFeature(null);
  };

  // Функция для создания анимированных частиц в hero секции
  useEffect(() => {
    if (heroRef.current && !particlesCreated) {
      const createParticles = () => {
        const hero = heroRef.current;
        if (!hero) return;

        // Очищаем предыдущие частицы
        const existingParticles = hero.querySelectorAll(".particle");
        existingParticles.forEach((particle) => particle.remove());

        // Количество частиц зависит от ширины экрана
        const isMobile = window.innerWidth <= 768;
        const particleCount = isMobile ? 10 : 20;

        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement("div");
          particle.classList.add("particle");

          // Случайные стили и размеры
          const size = Math.random() * 8 + 2; // 2-10px
          const left = Math.random() * 100; // 0-100%
          const delay = Math.random() * 20; // 0-20s
          const duration = Math.random() * 10 + 10; // 10-20s

          // Настраиваем стили
          particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(var(--accent-primary-rgb), ${
              Math.random() * 0.2 + 0.1
            });
            border-radius: 50%;
            left: ${left}%;
            bottom: 0;
            opacity: 0;
            z-index: 0;
            animation: floatParticle ${duration}s ease-in-out ${delay}s infinite;
          `;

          hero.appendChild(particle);
        }
      };

      createParticles();
      setParticlesCreated(true);

      // Пересоздаем частицы при изменении размера окна
      const handleResize = () => {
        createParticles();
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [particlesCreated]);

  return (
    <div className={styles.container}>
      <Slider slides={sliderData} autoPlayInterval={5000} />
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.logoContainer}>
          <img
            src="/logo-stroy.png"
            alt="Stroy City Logo"
            className={styles.logo}
          />
        </div>
        <h1 className={styles.welcomeTitle}>Добро пожаловать в Stroy City!</h1>
        <p className={styles.subtitle}>
          Лучшие строительные и кровельные материалы по доступным ценам
        </p>
        <Link to="/catalog" className={styles.ctaButton}>
          ПЕРЕЙТИ В КАТАЛОГ
        </Link>
      </section>

      {!isAuthenticated && (
        <section className={styles.discountBanner}>
          <div className={styles.discountContent}>
            <Discount className={styles.discountIcon} />
            <h2 className={styles.discountTitle}>Специальное предложение</h2>
            <p className={styles.discountText}>
              Зарегистрируйтесь на нашем сайте и получите{" "}
              <span className={styles.discountPercent}>5%</span> скидку на весь
              ассортимент товаров!
            </p>
            <p className={styles.discountInfo}>
              Для доступа к дополнительным возможностям сайта, включая заказ
              товаров и управление корзиной, необходима авторизация в системе.
            </p>
            <div className={styles.discountFeatures}>
              <div className={styles.discountFeature}>
                <PersonAdd className={styles.discountFeatureIcon} />
                <span>Простая регистрация</span>
              </div>
              <div className={styles.discountFeature}>
                <LocalOffer className={styles.discountFeatureIcon} />
                <span>Скидка 5% на всё</span>
              </div>
              <div className={styles.discountFeature}>
                <Star className={styles.discountFeatureIcon} />
                <span>Постоянные акции</span>
              </div>
            </div>
            <Link to={ROUTES.REGISTER} className={styles.discountButton}>
              ЗАРЕГИСТРИРОВАТЬСЯ <ArrowForward className={styles.arrowIcon} />
            </Link>
          </div>
        </section>
      )}

      <section
        className={`${styles.features} ${
          activeFeature !== null
            ? styles[`featuresBg${activeFeature + 1}`]
            : lastActiveFeature !== null
            ? styles[`featuresBg${lastActiveFeature + 1}`]
            : ""
        }`}
        ref={featuresRef}
      >
        <div
          className={styles.feature}
          onMouseEnter={() => handleFeatureMouseEnter(0)}
          onMouseLeave={handleFeatureMouseLeave}
        >
          <h3>Широкий выбор</h3>
          <p>Большой ассортимент строительных материалов различных категорий</p>
        </div>
        <div
          className={styles.feature}
          onMouseEnter={() => handleFeatureMouseEnter(1)}
          onMouseLeave={handleFeatureMouseLeave}
        >
          <h3>Быстрая доставка</h3>
          <p>Доставка по всей республике в кратчайшие сроки</p>
        </div>
        <div
          className={styles.feature}
          onMouseEnter={() => handleFeatureMouseEnter(2)}
          onMouseLeave={handleFeatureMouseLeave}
        >
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
          {partners.map((partner) => (
            <div
              key={partner.id}
              className={styles.partnerLogoContainer}
              onClick={() => handlePartnerClick(partner.url)}
              title={partner.name}
            >
              <img
                src={`/${String(partner.id).padStart(2, "0")}.png`}
                alt={partner.name}
                className={styles.partnerLogo}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
