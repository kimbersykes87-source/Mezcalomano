import { ReactNode } from "react";

export interface HeroProps {
  title: string;
  subtitle?: string;
  mobile: string;
  tablet: string;
  desktop: string;
  focalPoint?: string;
  alt?: string;
  standalone?: boolean;
  children?: ReactNode;
}

export default function Hero({
  title,
  subtitle,
  mobile,
  tablet,
  desktop,
  focalPoint = "center",
  alt = "",
  standalone = false,
  children,
}: HeroProps) {
  const position =
    focalPoint === "top" ? "center top" : focalPoint === "bottom" ? "center bottom" : "center center";

  return (
    <section
      className={`page-hero ${standalone ? "page-hero--standalone" : ""}`}
      aria-labelledby="page-hero-title"
    >
      <div className="page-hero__image-wrap">
        <picture>
          <source media="(min-width: 1024px)" srcSet={desktop} />
          <source media="(min-width: 768px)" srcSet={tablet} />
          <img
            src={mobile}
            alt={alt}
            className="page-hero__img"
            loading="eager"
            fetchPriority="high"
            style={{ objectPosition: position }}
          />
        </picture>
      </div>
      <div className="page-hero__content">
        <h1 id="page-hero-title" className="page-hero__title">
          {title}
        </h1>
        {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
